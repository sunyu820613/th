package com.example.taskmanager;

import com.example.taskmanager.controller.TaskController;
import com.example.taskmanager.dto.PageResult;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @Test
    void getTasks_shouldReturn200AndPageStructure() throws Exception {
        TaskResponse task = new TaskResponse();
        task.setId(1L);
        task.setTitle("学习 Spring Boot");
        PageResult<TaskResponse> fakePage = new PageResult<>(1, 20, 1, List.of(task));
        given(taskService.listTasks(1, 20)).willReturn(fakePage);

        mockMvc.perform(get("/tasks?page=1&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.records[0].title").value("学习 Spring Boot"));
    }
}
