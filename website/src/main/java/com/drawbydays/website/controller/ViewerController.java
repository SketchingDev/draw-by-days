package com.drawbydays.website.controller;

import com.drawbydays.website.ImageService;
import com.drawbydays.website.NextImageService;
import com.drawbydays.website.model.Image;
import com.drawbydays.website.model.ImageSequenceModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/")
public class ViewerController {

  private static final String MODEL_NAME = "imageSequence";
  private static final String VIEW_NAME = "viewer";

  private final ImageService imageService;

  private final NextImageService nextImageService;

  @Autowired
  public ViewerController(final ImageService imageService, final NextImageService nextImageService) {
    this.imageService = imageService;
    this.nextImageService = nextImageService;
  }

  @GetMapping
  public ModelAndView view() {
    final ImageSequenceModel model = new ImageSequenceModel();

    imageService.findFistImage().ifPresent(image -> populateModel(model, image));

    return new ModelAndView(VIEW_NAME, MODEL_NAME, model);
  }

  @GetMapping(params = "id")
  public ModelAndView view(@RequestParam final long id) {
    final ImageSequenceModel model = new ImageSequenceModel();

    imageService.findImageById(id).ifPresent(image -> populateModel(model, image));

    return new ModelAndView(VIEW_NAME, MODEL_NAME, model);
  }

  private void populateModel(final ImageSequenceModel model, final Image image) {
    model.setCurrentImage(image);

    nextImageService
            .findNextImage(image)
            .ifPresent(model::setNextImage);
  }
}
