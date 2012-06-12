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

class DocType:
	def __init__(self, d, dl):
		self.doc, self.doclist = d, dl
		
	def validate(self):
		"""
			* set home page
			* validate domain list
			* clear cache
		"""
		self.set_home_page()
		self.validate_domain_list()	

	def on_update(self):
		self.rewrite_pages()
		
		from webnotes.session_cache import clear_cache
		clear_cache('Guest')
		
	def rewrite_pages(self):
		"""rewrite all web pages"""
		import webnotes
		from webnotes.model.doclist import DocList
		from webnotes.model.code import get_obj
		
		# rewrite all web pages
		for name in webnotes.conn.sql("""select name, modified from `tabWeb Page` 
			where docstatus=0"""):
			DocList('Web Page', name[0]).save()
			webnotes.conn.set_value('Web Page', name[0], 'modified', name[1])

		# rewrite all blog pages
		for name in webnotes.conn.sql("""select name, modified from `tabBlog` 
			where docstatus=0 and ifnull(published,0)=1"""):
			DocList('Blog', name[0]).save()
			webnotes.conn.set_value('Blog', name[0], 'modified', name[1])
		
		from webnotes.cms.make import make_web_core
		make_web_core()
		
		get_obj('Page', 'blog').write_cms_page(force=True)
		get_obj('Page', 'Login Page').write_cms_page(force=True)
		
		webnotes.msgprint('Rebuilt all blogs and pages')
		
		
	def set_home_page(self):

		import webnotes
		from webnotes.model.doc import Document
		
		webnotes.conn.sql("""delete from `tabDefault Home Page` where role='Guest'""")
		
		d = Document('Default Home Page')
		d.parent = 'Control Panel'
		d.role = 'Guest'
		d.home_page = self.doc.home_page
		d.save()

	
	def validate_domain_list(self):
		"""
			Validate domain list if SaaS
		"""
		import webnotes

		try:
			from server_tools.gateway_utils import validate_domain_list
			res = validate_domain_list(self.doc.domain_list, webnotes.conn.cur_db_name)
			if not res:
				webnotes.msgprint("""\
					There was some error in validating the domain list.
					Please contact us at support@erpnext.com""", raise_exception=1)				
		except ImportError, e:
			pass
