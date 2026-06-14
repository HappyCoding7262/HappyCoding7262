import { Task } from '../types';

export const syncTaskToGoogle = async (token: string, task: Task) => {
  try {
    const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        notes: task.description,
        status: task.status === 'Completed' ? 'completed' : 'needsAction'
      }),
    });

    if (!response.ok) {
      console.error('Failed to sync to Google Tasks:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.id; // Returns googleTaskId
  } catch (error) {
    console.error('Check your OAuth Scopes; sync error:', error);
    return null;
  }
};

export const completeGoogleTask = async (token: string, googleTaskId: string) => {
  try {
    const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${googleTaskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed'
      }),
    });

    if (!response.ok) {
      console.error('Failed to update Google Task:', await response.text());
    }
  } catch (error) {
    console.error('Failed to update Google Task:', error);
  }
};
