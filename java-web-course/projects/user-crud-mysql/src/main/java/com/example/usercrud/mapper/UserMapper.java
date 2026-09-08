package com.example.usercrud.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
