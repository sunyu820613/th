package com.th.model;

import javax.validation.constraints.NotBlank;

public class User {
	/*
	 * ログインID
	 */
	@NotBlank(message="ログインIDを入力してください。")
	private String loginID;
	/*
	 * 従業員番号
	 */
	private String empNo;
	/*
	 * ログインパスワード
	 */
	private String loginPwd;
	/*
	 * 所属グループ
	 */
	private String groupID;
	/*
	 * 登録日付
	 */
	private String insertDate;
	/*
	 * 登録者
	 */
	private String insertUser;
	/*
	 * 更新日付
	 */
	private String updateDate;
	/*
	 * 更新者
	 */
	private String updateUser;

	public void setLoginID(String loginID) {
		this.loginID = loginID;
	}

	public String getLoginID() {
		return loginID;
	}

	public void setEmpNo(String empNo) {
		this.empNo = empNo;
	}

	public String getEmpNo() {
		return empNo;
	}

	public void setLoginPwd(String loginPwd) {
		this.loginPwd = loginPwd;
	}

	public String getLoginPwd() {
		return loginPwd;
	}

	public void setGroupID(String groupID) {
		this.groupID = groupID;
	}

	public String getGroupID() {
		return groupID;
	}

	public void setInsertDate(String insertDate) {
		this.insertDate = insertDate;
	}

	public String getInsertDate() {
		return insertDate;
	}

	public void setInsertUser(String insertUser) {
		this.insertUser = insertUser;
	}

	public String getInsertUser() {
		return insertUser;
	}

	public void setUpdateDate(String updateDate) {
		this.updateDate = updateDate;
	}

	public String getUpdateDate() {
		return updateDate;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public String getUpdateUser() {
		return updateUser;
	}

}
