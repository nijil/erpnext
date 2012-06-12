# ERPNext - web based ERP (http://erpnext.com)
# Copyright (C) 2012 Web Notes Technologies Pvt Ltd
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.	If not, see <http://www.gnu.org/licenses/>.

# Please edit this list and import only required elements
import webnotes

from webnotes.utils import add_days, add_months, add_years, cint, cstr, date_diff, default_fields, flt, fmt_money, formatdate, generate_hash, getTraceback, get_defaults, get_first_day, get_last_day, getdate, has_common, month_name, now, nowdate, replace_newlines, sendmail, set_default, str_esc_quote, user_format, validate_email_add
from webnotes.model import db_exists
from webnotes.model.doc import Document, addchild, getchildren, make_autoname
from webnotes.model.doclist import getlist, copy_doclist
from webnotes.model.code import get_obj, get_server_obj, run_server_obj, updatedb, check_syntax
from webnotes import session, form, is_testing, msgprint, errprint

set = webnotes.conn.set
sql = webnotes.conn.sql
get_value = webnotes.conn.get_value
in_transaction = webnotes.conn.in_transaction
convert_to_lists = webnotes.conn.convert_to_lists
	
# -----------------------------------------------------------------------------------------


class DocType:
	def __init__(self,d,dl):
		self.doc, self.doclist = d,dl

	def autoname(self):
		self.doc.name = self.doc.new_item_code
	
	# Get Ref Rates
	# --------------
	def get_rates(self):
		for d in getlist(self.doclist, "sales_bom_items"):
			r = sql("select ref_rate from `tabItem Price` where price_list_name=%s and parent=%s and ref_currency = %s", (self.doc.price_list, d.item_code, self.doc.currency))
			d.rate = r and flt(r[0][0]) or 0.00


	# Get Item Details
	# -----------------
	def get_item_details(self, name):
		det = sql("select description, stock_uom from `tabItem` where name = '%s' " % cstr(name))
		rate = sql("select ref_rate from `tabItem Price` where price_list_name = %s and parent = %s and ref_currency = %s", (self.doc.price_list, name, self.doc.currency))
		return {'description' : det and det[0][0] or '', 'uom': det and det[0][1] or '', 'rate': rate and flt(rate[0][0]) or 0.00}


	def get_main_item(self):
		is_main_item = []
		for d in getlist(self.doclist,'sales_bom_items'):
			if d.is_main_item == 'Yes':
				is_main_item.append(d.item_code)
			# Check that Sales Bom Item cannot be child of Sales Bom.
			if d.item_code == self.doc.new_item_code:
				msgprint("Sales Bom Item " + d.new_item_code +" cannot be child item.")
				raise Exception
		if len(is_main_item) > 1:
			msgprint('Main item cannot be more than one.')
			raise Exception , " Validation Error."
		if len(is_main_item) == 0:
			msgprint("At least one item should be main item.")
			raise Exception , " Validation Error."
		return is_main_item[0]


	# Make Item
	# ---------
	def create_new_item(self):
		i = Document("Item")		
		i.item_code = self.doc.new_item_code
		i.item_name = self.doc.new_item_name
		i.name = i.item_code
		i.is_sales_item = 'Yes'
		i.is_stock_item = 'No'
		i.save(1)

	# Update Rate	
	def update_ref_rate(self, i):
		ref_rate = 0
		if self.doc.price_list:
			if not cstr(self.doc.currency):
				msgprint("Please enter Currency.")
				raise Exception
			for d in getlist(self.doclist, "sales_bom_items"):
				item_rate = sql("select ref_rate,ref_currency from `tabItem Price` where price_list_name=%s and parent=%s", (self.doc.price_list, d.item_code))
				ref_rate += flt(d.qty) * (item_rate and flt(item_rate[0][0]) or 0)

			if ref_rate:
				# clear old rates
				sql("delete from `tabItem Price` where parent=%s and price_list_name = %s", (i.name, self.doc.price_list))
				
				pld = addchild(i,"ref_rate_details", "Item Price")
				pld.price_list_name = self.doc.price_list
				pld.ref_rate = flt(ref_rate)
				pld.ref_currency = self.doc.currency
				pld.save()

	# Update Items
	# ------------
	def update_item(self):
		i = Document("Item", self.doc.new_item_code)
		
		# update fields
		i.brand = self.doc.new_item_brand
		i.stock_uom = self.doc.stock_uom 
		i.item_group = self.doc.item_group
		

		i.item_name = self.doc.new_item_name
		i.description = self.doc.description

		# set default as 'No' or 0
		i.is_sample_item = 'No'
		i.is_asset_item = 'No'
		i.is_purchase_item = 'No'
		i.is_manufactured_item = 'No'
		i.is_sub_contracted_item = 'No'
		i.is_service_item = 'No'
		i.inspection_required = 'No'
		i.has_serial_no = 'No'
		i.lead_time_days = flt(0)
		# update rates
		self.update_ref_rate(i)
		i.save()
		msgprint("Items: %s updated successfully. To update more details open and edit item master" % self.doc.new_item_code)


	def validate(self):
		# check for duplicate
		self.check_duplicate()
		item_code = self.get_main_item()
		if not self.doc.new_item_code:
			self.doc.new_item_code = make_autoname(item_code +'.###')

 
	def on_update(self):
		# if no item code, create new item code
		if not sql("select name from tabItem where name=%s", self.doc.new_item_code):
			self.create_new_item()
		self.update_item()


	def check_duplicate(self, finder=0):
		il = getlist(self.doclist, "sales_bom_items")
		if not il:
			msgprint("Add atleast one item")
			return
		
		# get all Sales BOM that have the first item	
		sbl = sql("select distinct parent from `tabSales BOM Item` where item_code=%s and parent != %s and docstatus != 2", (il[0].item_code, self.doc.name))
		
		# check all siblings
		sub_items = [[d.item_code, flt(d.qty)] for d in il]
		
		for s in sbl:
			t = sql("select item_code, qty from `tabSales BOM Item` where parent=%s and docstatus != 2", s[0])
			t = [[d[0], flt(d[1])] for d in t]
	
			if self.has_same_items(sub_items, t):
				msgprint("%s has the same Sales BOM details" % s[0])
				raise Exception
		if finder:
			msgprint("There is no Sales BOM present with the following Combination.")


	def has_same_items(self, l1, l2):
		if len(l1)!=len(l2): return 0
		for l in l2:
			if l not in l1:
				return 0
		for l in l1:
			if l not in l2:
				return 0
		return 1
