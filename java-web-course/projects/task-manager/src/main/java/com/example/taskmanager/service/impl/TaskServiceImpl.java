package com.example.taskmanager.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.taskmanager.dto.PageResult;
import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.service.TaskService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }

    @Override
    public TaskResponse createTask(TaskCreateRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setUserId(request.getUserId());
        task.setStatus("TODO");
        task.setCreateTime(LocalDateTime.now());
        task.setUpdateTime(LocalDateTime.now());
        taskMapper.insert(task);
        return toResponse(task);
    }

    @Override
    public TaskResponse getTaskById(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new ResourceNotFoundException("任务不存在，id=" + id);
        }
        return toResponse(task);
    }

    @Override
    public TaskResponse updateTask(Long id, TaskCreateRequest request) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new ResourceNotFoundException("任务不存在，id=" + id);
        }
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setUserId(request.getUserId());
        task.setUpdateTime(LocalDateTime.now());
        taskMapper.updateById(task);
        return toResponse(task);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new ResourceNotFoundException("任务不存在，id=" + id);
        }
        taskMapper.deleteById(id);
    }

    @Override
    public PageResult<TaskResponse> listTasks(long page, long size) {
        Page<Task> pageParam = new Page<>(page, size);
        Page<Task> resultPage = taskMapper.selectPage(pageParam, null);

        List<TaskResponse> records = resultPage.getRecords().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PageResult<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal(), records);
    }

    public TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setUserId(task.getUserId());
        response.setCreateTime(task.getCreateTime());
        return response;
    }
}
