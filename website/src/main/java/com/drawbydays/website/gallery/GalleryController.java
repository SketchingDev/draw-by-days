package com.drawbydays.website.gallery;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.ModelAndView;

import javax.validation.Valid;
import java.util.Map;

@Controller
@RequestMapping("/")
public class GalleryController {

  private static final String GALLERY_DISPLAY_IMAGE = "gallery/displayImage";

  private final ImageRepository imageRepository;

  @Autowired
  public GalleryController(final ImageRepository imageRepository) {
    this.imageRepository = imageRepository;
  }

  @GetMapping
  public String view(final Map<String, Object> model) {

    imageRepository.findFirstByOrderByIdAsc()
            .ifPresent(image -> populateModel(model, image));

    return GALLERY_DISPLAY_IMAGE;
  }

  @GetMapping(params = "id")
  public String view(@RequestParam final long id, final Map<String, Object> model) {

      imageRepository.findById(id)
              .ifPresent(image -> populateModel(model, image));

    return GALLERY_DISPLAY_IMAGE;
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public String invalidId() {
    return GALLERY_DISPLAY_IMAGE;
  }

  private void populateModel(final Map<String, Object> model, final Image image) {
    model.put("image", image);

    imageRepository.findNextElseFirstByOrderByIdAsc(image.getId())
            .ifPresent(nextImage -> model.put("nextImage", nextImage));
  }
}
