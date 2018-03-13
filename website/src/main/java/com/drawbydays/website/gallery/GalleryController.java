package com.drawbydays.website.gallery;

import com.drawbydays.website.gallery.model.DisplayImage;
import com.drawbydays.website.gallery.model.ImageSequence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.Errors;
import com.drawbydays.website.gallery.model.Image;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.validation.Valid;

@Controller
@RequestMapping("/")
public class GalleryController {

  private static final String MODEL_NAME = "imageSequence";
  private static final String PRACTISE_VIEW = "gallery/displayImage";

  private final ImageService imageService;

  private final NextImageService nextImageService;

  @Autowired
  public GalleryController(final ImageService imageService, final NextImageService nextImageService) {
    this.imageService = imageService;
    this.nextImageService = nextImageService;
  }

  @GetMapping
  public ModelAndView view() {
    final ImageSequence model = new ImageSequence();

    imageService.findFistImage().ifPresent(image -> populateModel(model, image));

    return new ModelAndView(PRACTISE_VIEW, MODEL_NAME, model);
  }

  @GetMapping(params = "id")
  public ModelAndView view(@Valid final DisplayImage model, final Errors errors) {
    final ImageSequence imageSequenceModel = new ImageSequence();

    if (!errors.hasErrors()) {
      imageService.findImageById(model.getId()).ifPresent(image -> populateModel(imageSequenceModel, image));
    }

    return new ModelAndView(PRACTISE_VIEW, MODEL_NAME, imageSequenceModel);
  }

  private void populateModel(final ImageSequence model, final Image image) {
    model.setCurrentImage(image);

    nextImageService
            .findNextImage(image)
            .ifPresent(model::setNextImage);
  }
}
