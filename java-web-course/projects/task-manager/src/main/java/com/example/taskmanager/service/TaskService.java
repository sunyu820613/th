package com.example.taskmanager.service;

import com.example.taskmanager.dto.PageResult;
import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;

public interface TaskService {
    TaskResponse createTask(TaskCreateRequest request);
    TaskResponse getTaskById(Long id);
    TaskResponse updateTask(Long id, TaskCreateRequest request);
    void deleteTask(Long id);
    PageResult<TaskResponse> listTasks(long page, long size);
}
