package com.example.taskmanager.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.taskmanager.entity.Task;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TaskMapper extends BaseMapper<Task> {
}
