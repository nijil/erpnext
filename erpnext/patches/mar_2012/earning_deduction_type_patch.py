def execute():
	import webnotes
	webnotes.conn.sql("""
		UPDATE `tabDocField`
		SET fieldtype = 'Link', options = 'Deduction Type'
		WHERE parent = 'Deduction Detail'
		AND fieldname = 'd_type'
		""")
	webnotes.conn.sql("""
		UPDATE `tabDocField`
		SET fieldtype = 'Link', options = 'Earning Type'
		WHERE parent = 'Earning Detail'
		AND fieldname = 'e_type'
		""")
