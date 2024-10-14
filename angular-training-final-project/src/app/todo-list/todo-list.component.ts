import { Component, OnInit } from '@angular/core';
import { Todo } from '../../todo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  newTodoTitle: string = '';
  newDeadline: string = '';
  newDescription: string = '';

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      this.todos = JSON.parse(storedTodos).map((todo: any) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null
      }));
    }
  }

  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  addTodo() {
    if (this.newTodoTitle.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        title: this.newTodoTitle,
        deadline: this.newDeadline ? new Date(this.newDeadline) : null,
        completed: false,
        description: this.newDescription
      };
      this.todos.push(newTodo);
      this.saveTodos();
      this.newTodoTitle = '';
      this.newDeadline = '';
      this.newDescription = '';
    }
  }

  toggleTodo(todo: Todo) {
    todo.completed = !todo.completed;
    this.saveTodos();
  }

  removeTodo(todo: Todo) {
    this.todos = this.todos.filter((t) => t.id !== todo.id);
    this.saveTodos();
  }

  formatDateTimeForInput(date: Date | null): string {
    if (!date) return '';
    return date.toISOString().slice(0, 16); 
  }
}
