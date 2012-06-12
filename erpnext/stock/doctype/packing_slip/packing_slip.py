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

import webnotes
from webnotes.utils import flt, cint

class DocType:
	def __init__(self, d, dl):
		self.doc, self.doclist = d, dl


	def validate(self):
		"""
			* Validate existence of submitted Delivery Note
			* Case nos do not overlap
			* Check if packed qty doesn't exceed actual qty of delivery note

			It is necessary to validate case nos before checking quantity
		"""
		self.validate_delivery_note()
		self.validate_case_nos()
		self.validate_qty()


	def validate_delivery_note(self):
		"""
			Validates if delivery note has status as submitted
		"""
		res = webnotes.conn.sql("""\
			SELECT docstatus FROM `tabDelivery Note`
			WHERE name=%(delivery_note)s
			""", self.doc.fields)

		if not(res and res[0][0]==0):
			webnotes.msgprint("""Invalid Delivery Note. Delivery Note should exist 
				and should be in draft state. Please rectify and try again.""", 
				raise_exception=1)


	def validate_case_nos(self):
		"""
			Validate if case nos overlap
			If they do, recommend next case no.
		"""
		res = webnotes.conn.sql("""\
			SELECT name FROM `tabPacking Slip`
			WHERE delivery_note = %(delivery_note)s AND docstatus = 1 AND
			(from_case_no BETWEEN %(from_case_no)s AND %(to_case_no)s
			OR to_case_no BETWEEN %(from_case_no)s AND %(to_case_no)s)\
			""", self.doc.fields)

		if res:
			webnotes.msgprint("""Case No(s). already in use. Please rectify and try again.
				Recommended <b>From Case No. = %s</b>""" % self.get_recommended_case_no(),
				raise_exception=1)


	def validate_qty(self):
		"""
			Check packed qty across packing slips and delivery note
		"""
		# Get Delivery Note Items, Item Quantity Dict and No. of Cases for this Packing slip
		dn_details, ps_item_qty, no_of_cases = self.get_details_for_packing()

		for item in dn_details:
			new_packed_qty = (flt(ps_item_qty[item['item_code']]) * no_of_cases) + flt(item['packed_qty'])
			if new_packed_qty > flt(item['qty']):
				self.recommend_new_qty(item, ps_item_qty, no_of_cases)


	def get_details_for_packing(self):
		"""
			Returns
			* 'Delivery Note Items' query result as a list of dict
			* Item Quantity dict of current packing slip doc
			* No. of Cases of this packing slip
		"""
		item_codes = ", ".join([('"' + d.item_code + '"') for d in
			self.doclist])
		
		if not item_codes: webnotes.msgprint("No Items to Pack",
				raise_exception=1)

		res = webnotes.conn.sql("""\
			SELECT item_code, IFNULL(SUM(qty), 0) as qty, IFNULL(packed_qty, 0) as packed_qty, stock_uom
			FROM `tabDelivery Note Item`
			WHERE parent = "%s" AND item_code IN (%s)
			GROUP BY item_code""" % (self.doc.delivery_note, item_codes),
			as_dict=1)

		ps_item_qty = dict([[d.item_code, d.qty] for d in self.doclist])

		no_of_cases = cint(self.doc.to_case_no) - cint(self.doc.from_case_no) + 1

		return res, ps_item_qty, no_of_cases


	def recommend_new_qty(self, item, ps_item_qty, no_of_cases):
		"""
			Recommend a new quantity and raise a validation exception
		"""
		item['recommended_qty'] = (flt(item['qty']) - flt(item['packed_qty'])) / no_of_cases
		item['specified_qty'] = flt(ps_item_qty[item['item_code']])
		
		webnotes.msgprint("""\
			Invalid Quantity specified (%(specified_qty)s %(stock_uom)s).
			%(packed_qty)s out of %(qty)s %(stock_uom)s already packed for %(item_code)s.
			<b>Recommended quantity for %(item_code)s = %(recommended_qty)s \
			%(stock_uom)s</b>""" % item, raise_exception=1)


	def on_submit(self):
		"""
			* Update packed qty for all items
		"""
		self.update_packed_qty(event='submit')


	def on_cancel(self):
		"""
			* Update packed qty for all items
		"""
		self.update_packed_qty(event='cancel')


	def update_packed_qty(self, event=''):
		"""
			Updates packed qty for all items
		"""
		if event not in ['submit', 'cancel']:
			raise Exception('update_packed_quantity can only be called on submit or cancel')

		# Get Delivery Note Items, Item Quantity Dict and No. of Cases for this Packing slip
		dn_details, ps_item_qty, no_of_cases = self.get_details_for_packing()

		for item in dn_details:
			if event=='submit':
				new_packed_qty = flt(item['packed_qty']) + (flt(ps_item_qty[item['item_code']]) * no_of_cases)

			elif event=='cancel':
				new_packed_qty = flt(item['packed_qty']) - (flt(ps_item_qty[item['item_code']]) * no_of_cases)

			if (new_packed_qty < 0) or (new_packed_qty > flt(item['qty'])):
				webnotes.msgprint("Invalid new packed quantity for item %s. \
					Please try again or contact support@erpnext.com" % item['item_code'], raise_exception=1)

			webnotes.conn.sql("""\
				UPDATE `tabDelivery Note Item`
				SET packed_qty = %s
				WHERE parent = %s AND item_code = %s""",
				(new_packed_qty, self.doc.delivery_note, item['item_code']))			


	def update_item_details(self):
		"""
			Fill empty columns in Packing Slip Item
		"""
		self.doc.from_case_no = self.get_recommended_case_no()

		from webnotes.model.code import get_obj
		for d in self.doclist:
			psd_obj = get_obj(doc=d)
			psd_obj.get_item_details(self.doc.delivery_note)


	def get_recommended_case_no(self):
		"""
			Returns the next case no. for a new packing slip for a delivery
			note
		"""
		recommended_case_no = webnotes.conn.sql("""\
			SELECT MAX(to_case_no) FROM `tabPacking Slip`
			WHERE delivery_note = %(delivery_note)s AND docstatus=1""", self.doc.fields)

		return cint(recommended_case_no[0][0]) + 1
		

