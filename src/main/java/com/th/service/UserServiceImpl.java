package com.th.service;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.th.model.User;

@Service
public class UserServiceImpl implements UserService {

	private JdbcTemplate jdbcTemplate;

	UserServiceImpl(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public int create(String name, Integer age) {
		return jdbcTemplate.update("insert into USER(NAME, AGE) values(?, ?)", name, age);
	}

	@Override
	public List<User> getByName(String ID) {
		List<User> users = jdbcTemplate.query("select GROUPID, EMPNO from Tbl_user where LOGINID = ?",
				(resultSet, i) -> {
					User user = new User();
					user.setGroupID(resultSet.getString("GROUPID"));
					user.setEmpNo(resultSet.getString("EMPNO"));
					return user;
				}, ID);
		return users;
	}

	@Override
	public int deleteByName(String name) {
		return jdbcTemplate.update("delete from USER where NAME = ?", name);
	}

	@Override
	public int getAllUsers() {
		return jdbcTemplate.queryForObject("select count(1) from USER", Integer.class);
	}

	@Override
	public int deleteAllUsers() {
		return jdbcTemplate.update("delete from USER");
	}

}