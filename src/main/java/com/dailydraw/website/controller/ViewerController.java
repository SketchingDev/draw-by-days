package com.dailydraw.website.controller;

import com.dailydraw.website.storage.ImageRepository;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class ViewerController {

  private final ImageRepository imageRepository;

  @Autowired
  public ViewerController(final ImageRepository imageRepository) {
    this.imageRepository = Objects.requireNonNull(imageRepository);
  }

  @GetMapping
  public String viewer(final Model model) {
    imageRepository
        .getRandomImage()
        .ifPresent(image -> model.addAttribute("image", image));

    return "viewer";
  }
}