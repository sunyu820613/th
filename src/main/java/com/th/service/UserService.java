package com.th.service;

import java.util.List;

import com.th.model.User;

public interface UserService {

	/**
	 * ユーザを追加
	 *
	 * @param name
	 * @param age
	 */
	int create(String name, Integer age);

	/**
	 * ユーザを検索
	 *
	 * @param name
	 * @return
	 */
	List<User> getByName(String ID);

	/**
	 * ユーザを削除
	 *
	 * @param name
	 */
	int deleteByName(String name);

	/**
	 * ユーザ数をカウント
	 */
	int getAllUsers();

	/**
	 * 全ユーザーを削除
	 */
	int deleteAllUsers();

}