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
from webnotes.utils import load_json, cstr, now

@webnotes.whitelist()
def update_item(args):
	args = load_json(args)
	
	webnotes.conn.sql("update `tab%s` set `%s`=%s, modified=%s where name=%s" \
		% (args['dt'], args['fn'], '%s', '%s', '%s'), (args['text'], now(), args['dn']))

@webnotes.whitelist()
def has_answered(arg):
	return webnotes.conn.sql("select name from tabAnswer where owner=%s and question=%s", (webnotes.user.name, arg)) and 'Yes' or 'No'

@webnotes.whitelist()
def get_question(arg):
	return cstr(webnotes.conn.sql("select question from tabQuestion where name=%s", arg)[0][0])

@webnotes.whitelist()
def add_answer(args):
	args = load_json(args)
	
	from webnotes.model.doc import Document
	
	a = Document('Answer')
	a.answer = args['answer']
	a.question = args['qid']
	a.points = 1
	a.save(1)
	
	webnotes.conn.set_value('Question', args['qid'], 'modified', now())