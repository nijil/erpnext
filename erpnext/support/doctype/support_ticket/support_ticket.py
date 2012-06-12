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
from webnotes.model.doc import make_autoname

from utilities.transaction_base import TransactionBase
from home import update_feed

class DocType(TransactionBase):
	def __init__(self, doc, doclist=[]):
		self.doc = doc
		self.doclist = doclist

	def autoname(self):
		self.doc.name = make_autoname(self.doc.naming_series+'.#####')

	def send_response(self):
		"""
			Adds a new response to the ticket and sends an email to the sender
		"""
		if not self.doc.new_response:
			webnotes.msgprint("Please write something as a response", raise_exception=1)
		
		subject = '[' + self.doc.name + '] ' + (self.doc.subject or 'No Subject Specified')
		
		response = self.doc.new_response + '\n\n[Please do not change the subject while responding.]'

		# add last response to new response
		response += self.last_response()

		signature = webnotes.conn.get_value('Email Settings',None,'support_signature')
		if signature:
			response += '\n\n' + signature

		from webnotes.utils.email_lib import sendmail
		
		sendmail(\
			recipients = [self.doc.raised_by], \
			sender=webnotes.conn.get_value('Email Settings',None,'support_email'), \
			subject=subject, \
			msg=response)

		self.doc.new_response = None
		webnotes.conn.set(self.doc,'status','Waiting for Customer')
		self.make_response_record(response)
	
	def last_response(self):
		"""return last response"""
		tmp = webnotes.conn.sql("""select mail from `tabSupport Ticket Response`
			where parent = %s order by creation desc limit 1
			""", self.doc.name)
			
		if not tmp:
			tmp = webnotes.conn.sql("""
				SELECT description from `tabSupport Ticket`
				where name = %s
			""", self.doc.name)

		response_title = "=== In response to ==="

		if tmp and tmp[0][0]:
			return "\n\n" + response_title + "\n\n" + tmp[0][0].split(response_title)[0]
		else:
			return ""

		
	def make_response_record(self, response, from_email = None, content_type='text/plain'):
		"""
			Creates a new Support Ticket Response record
		"""
		# add to Support Ticket Response
		from webnotes.model.doc import Document
		d = Document('Support Ticket Response')
		d.from_email = from_email or webnotes.user.name
		d.parent = self.doc.name
		d.parenttype = "Support Ticket"
		d.parentfield = "responses"
		d.mail = response
		d.content_type = content_type
		d.save(1)
		
	def close_ticket(self):
		webnotes.conn.set(self.doc,'status','Closed')
		update_feed(self.doc)

	def reopen_ticket(self):
		webnotes.conn.set(self.doc,'status','Open')		
		update_feed(self.doc)		
