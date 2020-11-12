package com.th.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.th.model.User;
import com.th.service.UserService;

@Controller
@RequestMapping(value = "/")
public class LoginController {

	@Autowired
	public UserService userService;

	@RequestMapping(value = "/")
	public String index(Model model) {
		User userMap = new User();
		model.addAttribute("user", userMap);
		return "login";
	}

	@PostMapping("/login")
	public String login(Model model) {
		List<User> userList = userService.getByName("sunyu820613");
		model.addAttribute("userName", userList.get(0).getEmpNo());
		return "login";
	}
}
