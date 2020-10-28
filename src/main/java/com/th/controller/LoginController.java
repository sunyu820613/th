package com.th.controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/")
public class LoginController {

	@RequestMapping(value = "/login")
	public String login(Model model) {
		model.addAttribute("userName", "sunyu820613");
		return "login";
	}
}
