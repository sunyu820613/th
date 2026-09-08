package com.example.userapi.service;

import com.example.userapi.entity.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class UserService {

    private final List<User> users = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    public List<User> findAll() {
        return users;
    }

    public User findById(Long id) {
        for (User user : users) {
            if (user.getId().equals(id)) {
                return user;
            }
        }
        return null;
    }

    public User create(User user) {
        long newId = idGenerator.incrementAndGet();
        user.setId(newId);
        users.add(user);
        return user;
    }

    public User update(Long id, User newData) {
        User existing = findById(id);
        if (existing == null) {
            return null;
        }
        existing.setName(newData.getName());
        existing.setAge(newData.getAge());
        return existing;
    }

    public boolean delete(Long id) {
        return users.removeIf(u -> u.getId().equals(id));
    }
}
