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

from webnotes.utils import cint, flt, load_json, nowdate, cstr
from webnotes.model.code import get_obj
from webnotes.model.doc import Document
from webnotes import session, msgprint
from webnotes.model.doclist import getlist, copy_doclist

sql = webnotes.conn.sql
get_value = webnotes.conn.get_value
	
# -----------------------------------------------------------------------------------------
class DocType:
	def __init__(self, doc, doclist=[]):
		self.doc = doc
		self.doclist = doclist

	# validate receiver numbers
	# =========================================================
	def validate_receiver_nos(self,receiver_list):
		validated_receiver_list = []
		for d in receiver_list:
			# remove invalid character
			invalid_char_list = [' ', '+', '-', '(', ')']
			for x in invalid_char_list:
				d = d.replace(x, '')

			# mobile no validation for erpnext gateway
			if get_value('SMS Settings', None, 'sms_gateway_url'):
				mob_no = d
			else:
				if not d.startswith("0") and len(d) == 10:
					mob_no = "91" + d
				elif d.startswith("0") and len(d) == 11:
					mob_no = "91" + d[1:]
				elif len(d) == 12:
					mob_no = d
				else:
					msgprint("Invalid mobile no : " + cstr(d))
					raise Exception

				if not mob_no.isdigit():
					msgprint("Invalid mobile no : " + cstr(mob_no))
					raise Exception

			validated_receiver_list.append(mob_no)

		if not validated_receiver_list:
			msgprint("Please enter valid mobile nos")
			raise Exception

		return validated_receiver_list


	def get_sender_name(self):
		"returns name as SMS sender"
		sender_name = webnotes.conn.get_value('Global Defaults', None, 'sms_sender_name') or 'ERPNXT'
		if len(sender_name) > 6:
			msgprint("""
				As per TRAI rule, sender name must be exactly 6 characters.
				Kindly change sender name in Setup --> Global Defaults.
				
				Note: Hyphen, space, numeric digit, special characters are not allowed.
			""", raise_exception=1)
		return sender_name
	
	def get_contact_number(self, arg):
		"returns mobile number of the contact"
		args = load_json(arg)
		number = sql('select mobile_no, phone from tabContact where name=%s and %s=%s' % ('%s', args['key'], '%s'),\
			(args['contact_name'], args['value']))
		return number and (number[0][0] or number[0][1]) or ''
	
	def send_form_sms(self, arg):
		"called from client side"
		args = load_json(arg)
		self.send_sms([str(args['number'])], str(args['message']))

 
	# Send SMS
	# =========================================================
	def send_sms(self, receiver_list, msg, sender_name = ''):
		receiver_list = self.validate_receiver_nos(receiver_list)

		arg = { 'account_name'	: webnotes.conn.get_value('Control Panel',None,'account_id'),
				'receiver_list' : receiver_list,
				'message'		: msg,
				'sender_name'	: sender_name or self.get_sender_name()
			}

		# personalized or erpnext gateway
		if get_value('SMS Settings', None, 'sms_gateway_url'):
			ret = self.send_via_personalized_gateway(arg)
			msgprint(ret)


	# Send sms via personalized gateway
	# ==========================================================
	def send_via_personalized_gateway(self, arg):
		ss = get_obj('SMS Settings', 'SMS Settings', with_children=1)
		args = {ss.doc.message_parameter : arg.get('message')}
		for d in getlist(ss.doclist, 'static_parameter_details'):
			args[d.parameter] = d.value
		
		resp = []
		for d in arg.get('receiver_list'):
			args[ss.doc.receiver_parameter] = d
			resp.append(self.send_request(ss.doc.sms_gateway_url, args))

		return resp

	# Send Request
	# =========================================================
	def send_request(self, gateway_url, args):
		import httplib, urllib
		server, api_url = self.scrub_gateway_url(gateway_url)
		conn = httplib.HTTPConnection(server)  # open connection
		headers = {}
		headers['Accept'] = "text/plain, text/html, */*"
		conn.request('GET', api_url + urllib.urlencode(args), headers = headers)    # send request
		resp = conn.getresponse()     # get response
		resp = resp.read()
		return resp

	# Split gateway url to server and api url
	# =========================================================
	def scrub_gateway_url(self, url):
		url = url.replace('http://', '').strip().split('/')
		server = url.pop(0)
		api_url = '/' + '/'.join(url)
		if not api_url.endswith('?'):
			api_url += '?'
		return server, api_url


	# Create SMS Log
	# =========================================================
	def create_sms_log(self, arg, sent_sms):
		sl = Document('SMS Log')
		sl.sender_name = arg['sender_name']
		sl.sent_on = nowdate()
		sl.receiver_list = cstr(arg['receiver_list'])
		sl.message = arg['message']
		sl.no_of_requested_sms = len(arg['receiver_list'])
		sl.no_of_sent_sms = sent_sms
		sl.save(new=1)