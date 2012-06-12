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

"""Global Defaults"""
import webnotes

keydict = {
	"fiscal_year": "current_fiscal_year",
    'company': 'default_company',
    'currency': 'default_currency',
    'price_list_name': 'default_price_list',
	'price_list_currency': 'default_price_list_currency',
    'item_group': 'default_item_group',
    'customer_group': 'default_customer_group',
    'cust_master_name': 'cust_master_name', 
    'supplier_type': 'default_supplier_type',
    'supp_master_name': 'supp_master_name', 
    'territory': 'default_territory',
    'stock_uom': 'default_stock_uom',
    'fraction_currency': 'default_currency_fraction',
    'valuation_method': 'default_valuation_method',
	'date_format': 'date_format',
	'currency_format':'default_currency_format',
	'account_url':'account_url',
	'allow_negative_stock' : 'allow_negative_stock',
	'maintain_same_rate' : 'maintain_same_rate'
}

class DocType:
	def __init__(self, d, dl):
		self.doc, self.doclist = d, dl

	def get_bal(self,arg):
		"""get account balance (??)"""
		from webnotes.utils import fmt_money, flt
		bal = webnotes.conn.sql("select `tabAccount Balance`.balance,`tabAccount`.debit_or_credit from `tabAccount`,`tabAccount Balance` where `tabAccount Balance`.account=%s and `tabAccount Balance`.period=%s and `tabAccount Balance`.account=`tabAccount`.name ",(arg,self.doc.current_fiscal_year))
		if bal:
			return fmt_money(flt(bal[0][0])) + ' ' + bal[0][1]	
	
	def on_update(self):
		"""update defaults"""
		
		for key in keydict:
			webnotes.conn.set_default(key, self.doc.fields.get(keydict[key], ''))
			
		# update year start date and year end date from fiscal_year
		ysd = webnotes.conn.sql("""select year_start_date from `tabFiscal Year` 
			where name=%s""", self.doc.current_fiscal_year)
			
		ysd = ysd and ysd[0][0] or ''
		from webnotes.utils import get_first_day, get_last_day
		if ysd:
			webnotes.conn.set_default('year_start_date', ysd.strftime('%Y-%m-%d'))
			webnotes.conn.set_default('year_end_date', \
				get_last_day(get_first_day(ysd,0,11)).strftime('%Y-%m-%d'))
		
	def get_defaults(self):
		return webnotes.conn.get_defaults()
