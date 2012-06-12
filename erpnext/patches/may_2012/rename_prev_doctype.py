def execute():
	import webnotes
	dt_list = webnotes.conn.sql("select parent, fieldname from `tabDocField` where fieldname in ('against_doctype', 'prevdoc_doctype')")
	
	ren_dt = {
		'Indent' : 'Purchase Request',
		'Enquiry' : 'Opportunity',
		'Receivable Voucher' : 'Sales Invoice',
		'Payable Voucher' : 'Purchase Invoice'
	}

	for d in ren_dt:
		for dt in dt_list: 
			webnotes.conn.sql("update `tab%s` set %s = '%s' where %s = '%s'" % (dt[0], dt[1], ren_dt[d], dt[1], d))
