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

def execute():
	"""
		* Change type of mail_port field to int
		* reload email settings
	"""
	import webnotes
	webnotes.conn.sql("""
		UPDATE `tabDocField` SET fieldtype='Int'
		WHERE parent = 'Email Settings' AND fieldname = 'mail_port'
	""")

	from webnotes.modules import reload_doc
	reload_doc('setup', 'doctype', 'email_settings')
