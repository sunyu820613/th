package com.example.taskmanager;

import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TaskServiceTest {

    @Test
    void toResponse_shouldMapAllFields() {
        TaskServiceImpl taskService = new TaskServiceImpl(null);

        Task task = new Task();
        task.setId(1L);
        task.setTitle("学习 Spring Boot");
        task.setDescription("完成最终项目");
        task.setStatus("TODO");
        task.setUserId(100L);
        task.setCreateTime(LocalDateTime.of(2026, 1, 1, 10, 0));

        TaskResponse response = taskService.toResponse(task);

        assertEquals(1L, response.getId());
        assertEquals("学习 Spring Boot", response.getTitle());
        assertEquals("TODO", response.getStatus());
        assertEquals(100L, response.getUserId());
    }
}
