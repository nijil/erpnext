def execute():
	"""Make standard print formats readonly for system manager"""
	import webnotes.model.doc
	new_perms = [
		{
			'parent': 'Print Format',
			'parentfield': 'permissions',
			'parenttype': 'DocType',
			'role': 'System Manager',			
			'permlevel': 1,
			'read': 1,
		},
		{
			'parent': 'Print Format',
			'parentfield': 'permissions',
			'parenttype': 'DocType',
			'role': 'Administrator',			
			'permlevel': 1,
			'read': 1,
			'write': 1
		},
	]
	for perms in new_perms:
		doc = webnotes.model.doc.Document('DocPerm')
		doc.fields.update(perms)
		doc.save()
	webnotes.conn.commit()
	webnotes.conn.begin()
	import webnotes.model.sync
	webnotes.model.sync.sync('core', 'print_format')