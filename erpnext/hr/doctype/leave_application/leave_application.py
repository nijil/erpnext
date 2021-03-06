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
import datetime
	
# -----------------------------------------------------------------------------------------
class DocType:
	def __init__(self, doc, doclist):
		self.doc = doc
		self.doclist = doclist 


# ******************************************** client triggers ***********************************************

	# ------------------
	# get leave balance
	# ------------------
	def get_leave_balance(self):
		leave_all = sql("select total_leaves_allocated from `tabLeave Allocation` where employee = '%s' and leave_type = '%s' and fiscal_year = '%s' and docstatus = 1" % (self.doc.employee, self.doc.leave_type, self.doc.fiscal_year))
		leave_all = leave_all and flt(leave_all[0][0]) or 0
		leave_app = sql("select SUM(total_leave_days) from `tabLeave Application` where employee = '%s' and leave_type = '%s' and fiscal_year = '%s' and docstatus = 1" % (self.doc.employee, self.doc.leave_type, self.doc.fiscal_year))
		leave_app = leave_app and flt(leave_app[0][0]) or 0
		ret = {'leave_balance':leave_all - leave_app}
		return ret


# ************************************************ utilities *************************************************

	# -------------------
	def get_holidays(self):
		"""
			get total holidays
		"""
		tot_hol = sql("select count(*) from `tabHoliday` h1, `tabHoliday List` h2, `tabEmployee` e1 where e1.name = '%s' and h1.parent = h2.name and e1.holiday_list = h2.name and h1.holiday_date between '%s' and '%s'"% (self.doc.employee, self.doc.from_date, self.doc.to_date))
		if not tot_hol:
			tot_hol = sql("select count(*) from `tabHoliday` h1, `tabHoliday List` h2 where h1.parent = h2.name and h1.holiday_date between '%s' and '%s' and ifnull(h2.is_default,0) = 1 and h2.fiscal_year = %s"% (self.doc.from_date, self.doc.to_date, self.doc.fiscal_year))
		return tot_hol and flt(tot_hol[0][0]) or 0

	
	# ---------------------
	# get total leave days
	# ---------------------
	def get_total_leave_days(self):
		"""
			Calculates total leave days based on input and holidays
		"""
		ret = {'total_leave_days' : 0.5}
		if not self.doc.half_day:
			tot_days = date_diff(self.doc.to_date, self.doc.from_date) + 1
			holidays = self.get_holidays()
			ret = {
				'total_leave_days' : flt(tot_days)-flt(holidays)
			}
		return ret


# ************************************************ validate *************************************************

	# -----------------
	# validate to date
	# -----------------
	def validate_to_date(self):
		if self.doc.from_date and self.doc.to_date and (getdate(self.doc.to_date) < getdate(self.doc.from_date)):
			msgprint("To date cannot be before from date")
			raise Exception

	# --------------------------------
	# check whether leave type is lwp
	# --------------------------------
	def is_lwp(self):
		lwp = sql("select is_lwp from `tabLeave Type` where name = %s", self.doc.leave_type)
		return lwp and cint(lwp[0][0]) or 0

	# ------------------------
	# validate balance leaves
	# ------------------------
	def validate_balance_leaves(self):
		if self.doc.from_date and self.doc.to_date and not self.is_lwp():
			bal = self.get_leave_balance()
			tot_leaves = self.get_total_leave_days()
			bal, tot_leaves = bal, tot_leaves
			set(self.doc,'leave_balance',flt(bal['leave_balance']))
			set(self.doc,'total_leave_days',flt(tot_leaves['total_leave_days']))
			if flt(bal['leave_balance']) < flt(tot_leaves['total_leave_days']):
				msgprint("Employee : %s cannot apply for %s of more than %s days" % (self.doc.employee, self.doc.leave_type, flt(bal['leave_balance'])))
				raise Exception

	#
	# validate overlapping leaves
	#
	def validate_leave_overlap(self):
		for d in sql("""select name, leave_type, posting_date, from_date, to_date 
			from `tabLeave Application` 
			where 
			(from_date <= %(to_date)s and to_date >= %(from_date)s)
			and employee = %(employee)s
			and docstatus = 1 
			and name != %(name)s""", self.doc.fields, as_dict = 1):
 
			msgprint("Employee : %s has already applied for %s between %s and %s on %s. Please refer Leave Application : %s" % (self.doc.employee, cstr(d['leave_type']), formatdate(d['from_date']), formatdate(d['to_date']), formatdate(d['posting_date']), d['name']), raise_exception = 1)

	# ---------------------------------------------------------------------
	# validate max days for which leave can be applied for particular type
	# ---------------------------------------------------------------------
	def validate_max_days(self):
		max_days = sql("select max_days_allowed from `tabLeave Type` where name = '%s'" %(self.doc.leave_type))
		max_days = max_days and flt(max_days[0][0]) or 0
		if max_days and self.doc.total_leave_days > max_days:
			msgprint("Sorry ! You cannot apply for %s for more than %s days" % (self.doc.leave_type, max_days))
			raise Exception


	# ---------
	# validate
	# ---------
	def validate(self):
		self.validate_to_date()
		self.validate_balance_leaves()
		self.validate_leave_overlap()
		self.validate_max_days()
