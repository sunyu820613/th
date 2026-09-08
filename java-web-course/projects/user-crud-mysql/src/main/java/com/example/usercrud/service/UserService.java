package com.example.usercrud.service;

import com.example.usercrud.entity.User;

import java.util.List;

public interface UserService {

    List<User> listUsers();

    User getUser(Long id);

    User createUser(User user);

    User updateUser(Long id, User user);

    void deleteUser(Long id);
}
