def execute():
	import webnotes
	webnotes.conn.commit()
	webnotes.conn.sql("alter table __CacheItem modify `value` longtext")
	webnotes.conn.begin()
