# dont run this patch
def execute():
	import webnotes
	import webnotes.model.doctype
	from webnotes.utils import cint
	from webnotes.model.doc import Document
	from webnotes.model.code import get_obj
	doctype_list = webnotes.conn.sql("SELECT name FROM `tabDocType`")
	for dt in doctype_list:
		doclist = webnotes.model.doctype.get(dt[0], form=0)
		is_submittable = 0
		for d in doclist:
			if d.doctype == 'DocPerm' and d.fields.get('permlevel') == 0 \
				and cint(d.fields.get('submit')) == 1:
					is_submittable = 1
					break
		if is_submittable:
			dt_doc = Document('DocType', doclist[0].name)
			dt_doc.is_submittable = 1
			dt_doc.save()
			obj = get_obj(doc=dt_doc)
			obj.make_amendable()
			obj.on_update()
