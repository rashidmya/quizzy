'use client';

import { useActionState } from 'react';
import { addTodo, deleteTodo } from './actions';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Todo } from '@/lib/db/queries';

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [addState, addAction, isAddPending] = useActionState(addTodo, {
    input: '',
    message: '',
  });
  const [_, deleteAction] = useActionState(deleteTodo, {
    message: '',
  });

  return (
    <div className="space-y-4">
      <form action={addAction} className="flex mb-4">
        <input
          type="text"
          name="todo"
          defaultValue={addState.input || ''}
          placeholder="Add a new todo"
          className="flex-grow mr-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-gray-200 text-base"
        />
        <button
          type="submit"
          disabled={isAddPending}
          className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-50 text-sm font-medium"
        >
          {isAddPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Plus className="size-5" />
          )}
        </button>
      </form>
      {addState.message && (
        <p className="text-sm text-gray-400 mb-2">{addState.message}</p>
      )}
      <ul className="space-y-2">
        {initialTodos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between py-2 px-4 rounded-lg bg-gray-800 shadow-sm"
          >
            <span className="text-gray-200 text-sm">{todo.text}</span>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                className="text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-md p-1 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
