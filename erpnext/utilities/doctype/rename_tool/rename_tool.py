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
	def __init__(self, d, dl=[]):
		self.doc, self.doclist = d, dl
		
	def rename(self):
		"""
		Generate update quereies for rename
		"""
		import webnotes.model
		from webnotes.model.code import get_obj
		
		# call on_rename method if exists
		obj = get_obj(self.doc.select_doctype, self.doc.document_to_rename)
		if hasattr(obj, 'on_rename'):
			obj.on_rename(self.doc.new_name,self.doc.document_to_rename)
			
		# rename the document		
		webnotes.model.rename(self.doc.select_doctype, self.doc.document_to_rename, self.doc.new_name)
		
		webnotes.msgprint("Successfully renamed "+self.doc.select_doctype+" : '"+self.doc.document_to_rename+"' to <b>"+self.doc.new_name+"</b>")
