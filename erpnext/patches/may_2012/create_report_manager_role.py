def execute():
	import webnotes
	from webnotes.model.doc import Document
	
	if not webnotes.conn.sql("select name from `tabRole` where name = 'Report Manager'"):
		r = Document('Role')
		r.role_name = 'Report Manager'
		r.module = 'Core'
		r.save()