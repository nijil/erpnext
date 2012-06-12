// render
wn.doclistviews['Sales Invoice'] = wn.views.ListView.extend({
	init: function(d) {
		this._super(d);
		this.fields = this.fields.concat([
			"`tabSales Invoice`.customer_name", 
			"ifnull(`tabSales Invoice`.outstanding_amount,0) as outstanding_amount", 
			"ifnull(`tabSales Invoice`.grand_total,0) as grand_total", 
			"`tabSales Invoice`.currency", 
			"ifnull(`tabSales Invoice`.grand_total_export,0) as grand_total_export"
		]);
	},
	prepare_data: function(data) {
		this._super(data);
		data.paid = flt((data.grand_total - data.outstanding_amount) / data.grand_total * 100, 2);
	},
	columns: [
		{width: '3%', content: 'check'},
		{width: '5%', content: 'avatar'},
		{width: '3%', content: 'docstatus'},
		{width: '15%', content: 'name'},
		{width: '34%', content: 'customer_name+tags', css: {color:'#222'}},
		{
			width: '18%', 
			content: function(parent, data) { 
				$(parent).html(data.currency + ' ' + fmt_money(data.grand_total_export)) 
			},
			css: {'text-align':'right'}
		},
		{width: '10%', content: 'paid', type:'bar-graph', label:'Paid'},
		{width: '12%', content:'modified', css: {'text-align': 'right', 'color':'#777'}}
	]
});
