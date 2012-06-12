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

cur_frm.add_fetch('employee', 'company', 'company');	

//get employee's name based on employee id selected
cur_frm.cscript.employee = function(doc,cdt,cdn){
  if(doc.employee) get_server_fields('get_emp_name', '', '', doc, cdt, cdn, 1);
  refresh_field('employee_name'); 
}


//Employee
//-----------------------------
cur_frm.fields_dict['employee'].get_query = function(doc,cdt,cdn) {
  return 'SELECT `tabEmployee`.`name` FROM `tabEmployee` WHERE `tabEmployee`.status = "Active" AND `tabEmployee`.`docstatus`!= 2 AND `tabEmployee`.%(key)s LIKE "%s"  ORDER BY `tabEmployee`.`name` ASC LIMIT 50';
}
