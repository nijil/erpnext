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
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

# Please edit this list and import only required elements
import webnotes

from webnotes.utils import cstr, cint, flt, cstr, getdate

sql = webnotes.conn.sql
get_value = webnotes.conn.get_value
msgprint = webnotes.msgprint

# -----------------------------------------------------------------------------------------


class DocType:
	def __init__(self, doc, doclist=[]):
		self.doc = doc
		self.doclist = doclist
	
	#check for item quantity available in stock
	def actual_amt_check(self):
		if self.doc.batch_no:
			batch_bal = flt(sql("select sum(actual_qty) from `tabStock Ledger Entry` where warehouse = '%s' and item_code = '%s' and batch_no = '%s'"%(self.doc.warehouse,self.doc.item_code,self.doc.batch_no))[0][0])
			self.doc.fields.update({'batch_bal': batch_bal})

			if (batch_bal + self.doc.actual_qty) < 0:
				msgprint("""Not enough quantity (requested: %(actual_qty)s, current: %(batch_bal)s in Batch 
		<b>%(batch_no)s</b> for Item <b>%(item_code)s</b> at Warehouse<b>%(warehouse)s</b> 
		as on %(posting_date)s %(posting_time)s""" % self.doc.fields, raise_exception = 1)

			self.doc.fields.pop('batch_bal')
			 

	# mandatory
	# ---------
	
	def validate_mandatory(self):		
		mandatory = ['warehouse','transaction_date','posting_date','voucher_type','voucher_no','actual_qty','company','fiscal_year']
		for k in mandatory:
			if self.doc.fields.get(k)==None:
				msgprint("Stock Ledger Entry: '%s' is mandatory" % k, raise_exception = 1)
			elif k == 'warehouse':
				if not sql("select name from tabWarehouse where name = '%s'" % self.doc.fields.get(k)):
					msgprint("Warehouse: '%s' does not exist in the system. Please check." % self.doc.fields.get(k), raise_exception = 1)

	# validate for item
	# -----------------
	
	def validate_item(self):
		item_det = sql("select name, has_batch_no, docstatus from tabItem where name = '%s'" % self.doc.item_code)

		# check item exists
		if item_det:
			item_det = item_det and item_det[0]
		else:
			msgprint("Item: '%s' does not exist in the system. Please check." % self.doc.item_code, raise_exception = 1)
			
		# check if item is trashed
		if cint(item_det[2])==2:
			msgprint("Item: '%s' is trashed, cannot make a stock transaction against a trashed item" % self.doc.item_code, raise_exception = 1)
			
		# check if batch number is required
		if item_det[1]=='Yes' and self.doc.voucher_type != 'Stock Reconciliation':
			if not self.doc.batch_no:
				msgprint("Batch number is mandatory for Item '%s'" % self.doc.item_code, raise_exception = 1)
				raise Exception
		
			# check if batch belongs to item
			if not sql("select name from `tabBatch` where item='%s' and name ='%s' and docstatus != 2" % (self.doc.item_code, self.doc.batch_no)):
				msgprint("'%s' is not a valid Batch Number for Item '%s'" % (self.doc.batch_no, self.doc.item_code), raise_exception = 1)
	
	# Nobody can do SL Entries where posting date is before freezing date except authorized person
	#----------------------------------------------------------------------------------------------
	def check_stock_frozen_date(self):
		stock_frozen_upto = get_value('Global Defaults', None, 'stock_frozen_upto') or ''
		if stock_frozen_upto:
			stock_auth_role = get_value('Global Defaults', None,'stock_auth_role')
			if getdate(self.doc.posting_date) <= getdate(stock_frozen_upto) and not stock_auth_role in webnotes.user.get_roles():
				msgprint("You are not authorized to do / modify back dated stock entries before %s" % getdate(stock_frozen_upto).strftime('%d-%m-%Y'), raise_exception=1)

	def validate_posting_time(self):
		""" Validate posting time format"""
		if self.doc.posting_time and len(self.doc.posting_time.split(':')) > 2:
			msgprint("Wrong format of posting time, can not complete the transaction. If you think \
				you entered posting time correctly, please contact ERPNext support team.")
			raise Exception
	
	def scrub_posting_time(self):
		if not self.doc.posting_time or self.doc.posting_time == '00:0':
			self.doc.posting_time = '00:00'
		if len(self.doc.posting_time.split(':')) > 2:
			self.doc.posting_time = '00:00'
			

	def validate(self):
		self.validate_mandatory()
		self.validate_posting_time()
		self.validate_item()
		self.actual_amt_check()
		self.check_stock_frozen_date()
		self.scrub_posting_time()
