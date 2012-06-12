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

wn.provide('erpnext.todo');

erpnext.todo.refresh = function() {
	wn.call({
		method: 'utilities.page.todo.todo.get',
		callback: function(r,rt) {
			$('#todo-list').empty();
			if(r.message) {
				for(var i in r.message) {
					new erpnext.todo.ToDoItem(r.message[i]);
				}
			} else {
				$('#todo-list').html('<div class="help-box">Nothing to do :)</div>');
			}
		}
	});
	
	$('#add-todo').click(function() {
		erpnext.todo.make_dialog({
			date:get_today(), priority:'Medium', checked:0, description:''});
	})
}

erpnext.todo.ToDoItem = Class.extend({
	init: function(todo) {
		label_map = {
			'High': 'label-important',
			'Medium': 'label-info',
			'Low':''
		}
		todo.labelclass = label_map[todo.priority];
		todo.userdate = dateutil.str_to_user(todo.date) || '';
		if(todo.assigned_by) {
			todo.fullname = repl("[By %(fullname)s] ", {
				fullname: wn.boot.user_info[todo.assigned_by].fullname
			})
		} else { todo.fullname = ''; }
		if(todo.reference_name && todo.reference_type) {
			todo.link = repl('<a href="#!Form/%(reference_type)s/%(reference_name)s">\
						%(reference_type)s: %(reference_name)s</a>', todo);
		} else if(todo.reference_type) {
			todo.link = repl('<a href="#!List/%(reference_type)s">\
						%(reference_type)s</a>', todo);
		} else {
			todo.link = '';
		}
		if(!todo.description) todo.description = '';
		$('#todo-list').append(repl('<div class="todoitem">\
				<span class="description">\
					<span class="label %(labelclass)s">%(priority)s</span>\
					<span class="help" style="margin-right: 7px">%(userdate)s</span>\
					%(fullname)s%(description)s</span>\
					<span class="ref_link">&rarr; &nbsp;\
					%(link)s</span>\
					<a href="#" class="close">&times;</a>\
		</div>', todo));
		$todo = $('div.todoitem:last');
		
		if(todo.checked) {
			$todo.find('.description').css('text-decoration', 'line-through');
		}
		
		if(!todo.reference_type)
			$todo.find('.ref_link').toggle(false);
		
		$todo.find('.description')
			.data('todo', todo)
			.click(function() {
				erpnext.todo.make_dialog($(this).data('todo'));
				return false;
			});
			
		$todo.find('.close')
			.data('name', todo.name)
			.click(function() {
				$(this).parent().css('opacity', 0.5);
				wn.call({
					method:'utilities.page.todo.todo.delete',
					args: {name: $(this).data('name')},
					callback: function() {
						erpnext.todo.refresh();
					}
				});
				return false;
			})
	}
});

erpnext.todo.make_dialog = function(det) {
	if(!erpnext.todo.dialog) {
		var dialog = new wn.widgets.Dialog();
		dialog.make({
			width: 480,
			title: 'To Do', 
			fields: [
				{fieldtype:'Date', fieldname:'date', label:'Event Date', reqd:1},
				{fieldtype:'Text', fieldname:'description', label:'Description', reqd:1},
				{fieldtype:'Check', fieldname:'checked', label:'Completed'},
				{fieldtype:'Select', fieldname:'priority', label:'Priority', reqd:1, 'options':['Medium','High','Low'].join('\n')},
				{fieldtype:'Button', fieldname:'save', label:'Save'}
			]
		});
		
		dialog.fields_dict.save.input.onclick = function() {
			erpnext.todo.save(this);	
		}
		erpnext.todo.dialog = dialog;
	}

	if(det) {
		erpnext.todo.dialog.set_values({
			date: det.date,
			priority: det.priority,
			description: det.description,
			checked: det.checked
		});
		erpnext.todo.dialog.det = det;		
	}
	erpnext.todo.dialog.show();
	
}

erpnext.todo.save = function(btn) {
	var d = erpnext.todo.dialog;
	var det = d.get_values();
	
	if(!det) {
	 	return;
	}
	
	det.name = d.det.name || '';
	wn.call({
		method:'utilities.page.todo.todo.edit',
		args: det,
		btn: btn,
		callback: function() {
			erpnext.todo.dialog.hide();
			erpnext.todo.refresh();
		}
	});
}

wn.pages.todo.onload = function() {
	// load todos
	erpnext.todo.refresh();
}
