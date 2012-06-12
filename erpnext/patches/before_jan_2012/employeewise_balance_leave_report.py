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

"""
	This patch changes criteria name
	of search criteria "employeewise_balance_leave_report"
	from "Employeewise Balance Leave Report"
	to "Employee Leave Balance Report"
"""
def execute():
	from webnotes.model.doc import Document
	from webnotes.modules import reload_doc
	reload_doc('hr', 'search_criteria', 'employeewise_balance_leave_report')
	d = Document('Search Criteria', 'employeewise_balance_leave_report')
	d.criteria_name = 'Employee Leave Balance Report'
	d.description = 'Employeewise Balance Leave Report'
	d.save()
