$(document).ready(function() {

	var ToDo = function() {
		this.data = { tasksList: [
			{'id': '9', 'status': 'incomplete', 'task': 'Do something today...'}
		]};
	}

	// Refresh the state of the "Clear complete (#) button"
	ToDo.prototype.refreshClearBtn = function() {
		var total_incomplete = todo.countBy('status', 'complete');
		var text = "Clear completed (" + total_incomplete + ")";
		$("#clear-completed").hide();
		if(total_incomplete)
			$("#clear-completed").show().html(text);
	}

	ToDo.prototype.refreshItem = function(id) {
		var item_data = {tasksList: [todo.findItem(id)]};
		var item_template = $("#tasks-list-template").html();
		var item_html = _.template(item_template, item_data);
		item_html = $(item_html).find('li').html();
		$('ul li#'+id).html(item_html);
		todo.refreshCount();
	}

	ToDo.prototype.updateItem = function(id, type, value) {
		var item_obj = todo.findItem(id);
		item_obj[type] = value;
		todo.refreshCount();
	}

	ToDo.prototype.getMaxOfArray = function(numArray) {
		return Math.max.apply(null, numArray);
	}

	ToDo.prototype.updateItemStatusHTML = function(id, status) {
		$("ul li#"+id).attr('class', status);
	}

	ToDo.prototype.addItem = function(item) {
		var item_obj = {
			'id': item.id,
			'status': item.status,
			'task': item.task
		};
		todo.data.tasksList.push(item_obj);
		todo.addItemToList(item_obj);
		todo.refreshCount();
	}

	ToDo.prototype.addItemToList = function(item_obj) {
		var item_data = { tasksList: [
			item_obj
		]};
		var item_template = $("#tasks-list-template").html();
		var item_template = _.template(item_template, item_data);
		var item_html = $(item_template).find('li')[0].outerHTML;
		$(item_html).appendTo('#all-tasks-list ul').hide().fadeIn();
	}

	ToDo.prototype.removeItem = function(id) {
		var item_obj = todo.findItem(id);
		todo.data.tasksList = _.without(todo.data.tasksList, item_obj);
		todo.refreshCount();
	}

	ToDo.prototype.removeItemFromList = function(id) {
		$('ul#tasks-list li#'+id).remove();
	}

	ToDo.prototype.countBy = function(filter, value) {
		var task_count = 0;
		for (var i = 0; i < todo.data.tasksList.length; i++) {
			if (todo.data.tasksList[i][filter] == value) {
				task_count++;
			}
		}
		return task_count;
	}

	ToDo.prototype.refreshCount = function() {
		var total_incomplete = todo.countBy('status', 'incomplete');
		var text = total_incomplete.toString();
		text = text + " " + (total_incomplete == 0 || total_incomplete > 1 ? "tasks" : "task");
		text = text + " left";
		$("#tasks-left").html(text);
	}

	ToDo.prototype.findItem = function(id) {
		for (var i = 0; i < todo.data.tasksList.length; i++) {
			if (todo.data.tasksList[i]['id'] == id) {
				return todo.data.tasksList[i];
				break;
			}
		}
	} 

	ToDo.prototype.generateId = function() {
		var new_id = todo.getMaxOfArray($.map(todo.data.tasksList, function(task){
			return parseInt(task.id);
		})) + 1;
		return new_id;
	}

	var todo = new ToDo();

	_.templateSettings = {
		interpolate: /\#\#\=(.+?)\#\#/g,
		evaluate: /\#\#(.+?)\#\#/g
	};

	// Refresh the total tasks left counter
	todo.refreshCount();

	todo.refreshClearBtn();

	// Render the list
	var list_html = _.template($("#tasks-list-template").html(), todo.data);
	$('#all-tasks-list').html(list_html);

	$( "#tasks-list" ).sortable({
		items: "> li",
		cursor: "move",
		handle: '.drag-handle',
		stop: function() {
			var items_order = $(this).sortable('toArray');
		}
	});

	// Add task
	$('#task-form input#add-btn').on('click', function(event){
		event.preventDefault();
		var task = {
			id: todo.generateId(),
			task: $('#task-input').val(),
			status: 'incomplete'
		};
		if(task.task !== '') {
			todo.addItem(task);
			$('#task-form #task-input').val('');
		}
	});

	// Edit task
	$("#all-tasks-list").on("dblclick", '#tasks-list li .task', function() {
		item_id = $(this).parent().attr('id');
		var text = $.trim($(this).text());
		var task = $(this).parent();
		task.html("<input type='text' class='task-edit' value='" + text + "'>");
		task.find('input:text').focus();
	});

	$("#all-tasks-list").on("keydown", '#tasks-list li input.task-edit', function(e) {
		if(e.which == '13')
		{
			var task_text = $(this).val();
			if(task_text !== '')
			{
				var id = $(this).parent().attr('id');
				todo.updateItem(id, 'task', task_text);
			}
			todo.refreshItem(id);
		}
	});

	$("#all-tasks-list").on("blur", '#tasks-list li input.task-edit', function() {
		var task_text = $(this).val();
		if(task_text !== '')
		{
			var id = $(this).parent().attr('id');
			todo.updateItem(id, 'task', task_text);
		}
		todo.refreshItem(id);
	});

	// Remove task
	$('#all-tasks-list').on('click', '#tasks-list .item-remove', function(){
		var task_id = $(this).parent().attr('id');
		todo.removeItem(task_id);
		todo.removeItemFromList(task_id);
		todo.refreshClearBtn();
	});

	// Mark as complete/incomplete
	$("#all-tasks-list").on('change', '#tasks-list li .item-checkbox input', function(){
		var task_id = $(this).closest('li').attr('id');
		var checked = $(this).prop('checked');
		var update_status = (checked===true) ? 'complete' : 'incomplete'

		todo.updateItem(task_id, 'status', update_status);
		todo.updateItemStatusHTML(task_id, update_status);
		todo.refreshClearBtn();
	});

	// Clear completed tasks
	$("#clear-completed").on('click', function() {
		_.each(todo.data.tasksList, function(item_obj) {
			if(item_obj.status === 'complete') {
				todo.removeItem(item_obj.id);
				todo.removeItemFromList(item_obj.id);
			}
		});
		todo.refreshClearBtn();
	});

	

	
	
});