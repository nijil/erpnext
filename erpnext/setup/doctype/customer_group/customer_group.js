// ERPNext - web based ERP (http://erpnext.com)
// Copyright (C) 2012 Web Notes Technologies Pvt Ltd
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

 

cur_frm.cscript.onload = function(){
   
  if(doc.__islocal){
    doc.parent_customer_group = 'Root';
    refresh('parent_customer_group');
  }
}

cur_frm.cscript.refresh = function(doc, cdt, cdn) {
   
}

//get query select Customer Group
cur_frm.fields_dict['parent_customer_group'].get_query = function(doc,cdt,cdn) {
  return 'SELECT `tabCustomer Group`.`name`,`tabCustomer Group`.`parent_customer_group` FROM `tabCustomer Group` WHERE `tabCustomer Group`.`is_group` = "Yes" AND `tabCustomer Group`.`docstatus`!= 2 AND `tabCustomer Group`.%(key)s LIKE "%s" ORDER BY  `tabCustomer Group`.`name` ASC LIMIT 50';
}