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
	def __init__(self,d,dt):
		self.doc, self.doclist = d,dt
		
	#==========================================================================
	def get_att_list(self):
		lst = [['Attendance','','','Please fill columns which are Mandatory.',' Please do not modify the structure','',''],['','','','','','',''],['[Mandatory]','','[Mandatory]','[Mandatory]','[Mandatory]','[Mandatory]','[Mandatory]'],['Employee','Employee Name','Attendance Date','Status','Fiscal Year','Company','Naming Series']]
		
		dt = self.date_diff_list()					# get date list inbetween from date and to date		
		att_dt = self.get_att_data()				# get default attendance data like fiscal yr, company, naming series
			
		fy, comp, sr = att_dt['fy'], att_dt['comp'], att_dt['sr']	 
		res = sql("select name, employee_name from `tabEmployee` where status = 'Active' and docstatus !=2") 
	 
		for d in dt:
			for r in res:			 
				lst.append([r[0],r[1],d,'',fy,comp,sr])

		return lst
	
	#------------------------------------------------------------------------------
	# get date list inbetween from date and to date
	def date_diff_list(self):
		import datetime
		#get from date 
		att_fr_date = self.doc.att_fr_date and self.doc.att_fr_date or ''
		
		#get to date
		att_to_date = self.doc.att_to_date and self.doc.att_to_date or ''

		if att_to_date:
			r = (getdate(self.doc.att_to_date)+datetime.timedelta(days=1)-getdate(self.doc.att_fr_date)).days
		else:
			r = 1
		dateList = [getdate(self.doc.att_fr_date)+datetime.timedelta(days=i) for i in range(0,r)]
		dt=([str(date) for date in dateList])
		
		return dt

	#------------------------------------------------------------------------------
	def get_att_data(self):
		fy = get_defaults()['fiscal_year']		#get default fiscal year 
		comp = get_defaults()['company']		#get default company
		
		#get naming series of attendance
		import webnotes.model.doctype
		docfield = webnotes.model.doctype.get('Attendance')
		series = [d.options for d in docfield if d.doctype == 'DocField' and d.fieldname == 'naming_series']
		if not series:
			msgprint("Please create naming series for Attendance.\nGo to Setup--> Numbering Series.")
			raise Exception
		else:
			sr = series[0] or ''
		
		return {'fy':fy,'comp':comp,'sr':sr}

	#=================================================================================	
	def import_att_data(self):
		filename = self.doc.file_list.split(',')

		if not filename:
			msgprint("Please attach a .CSV File.")
			raise Exception
		
		if filename[0].find('.csv') < 0:
			raise Exception
		
		if not filename and filename[0] and file[1]:
			msgprint("Please Attach File. ")
			raise Exception
			
		from webnotes.utils import file_manager
		fn, content = file_manager.get_file(filename[1])
 
	# NOTE: Don't know why this condition exists
		if not isinstance(content, basestring) and hasattr(content, 'tostring'):
			content = content.tostring()

		import webnotes.model.import_docs
		im = webnotes.model.import_docs.CSVImport()
		out = im.import_csv(content,self.doc.import_date_format, cint(self.doc.overwrite))
		return out

