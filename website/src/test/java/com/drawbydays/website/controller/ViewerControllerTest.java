package com.drawbydays.website.controller;

import com.drawbydays.website.ImageService;
import com.drawbydays.website.NextImageService;
import com.drawbydays.website.model.Image;
import com.drawbydays.website.model.ImageSequenceModel;
import com.drawbydays.website.model.ViewImageModel;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.Map;
import java.util.Optional;

import static junit.framework.TestCase.assertTrue;
import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ViewerControllerTest {

  private static final long IMAGE_ID = 0L;

  private static final String MODEL_KEY = "imageSequence";

  @Mock
  private ImageService imageService;

  @Mock
  private NextImageService nextImageService;

  private ViewerController controller;

  @Before
  public void setup() {
    controller = new ViewerController(imageService, nextImageService);
  }

  @Test
  public void view_calls_imageService_findFirstImage() {
    when(imageService.findFistImage()).thenReturn(Optional.empty());

    controller.view();

    verify(imageService).findFistImage();
  }

  @Test
  public void view_id_calls_imageService_findImageById_with_id_parameter() {
    when(imageService.findImageById(anyLong())).thenReturn(Optional.empty());

    final ViewImageModel viewImageModel = mock(ViewImageModel.class);
    when(viewImageModel.getId()).thenReturn(IMAGE_ID);

    controller.view(viewImageModel, mock(Errors.class));

    verify(imageService).findImageById(eq(IMAGE_ID));
  }

  @Test
  public void view_returns_imageSequence_with_null_currentImage_and_null_nextImage_if_no_data() {
    when(imageService.findFistImage()).thenReturn(Optional.empty());

    final ModelAndView modelAndView = controller.view();

    final ImageSequenceModel model = extractImageSequenceModel(modelAndView);
    assertNull(model.getCurrentImage());
    assertNull(model.getNextImage());
  }

  @Test
  public void view_returns_imageSequence_with_currentImage_if_imageService_returns_image() {
    final Image image = mock(Image.class);
    when(imageService.findFistImage()).thenReturn(Optional.of(image));
    when(nextImageService.findNextImage(any())).thenReturn(Optional.empty());

    final ModelAndView modelAndView = controller.view();

    final ImageSequenceModel model = extractImageSequenceModel(modelAndView);
    assertSame(image, model.getCurrentImage());
    assertNull(model.getNextImage());
  }

  @Test
  public void view_returns_imageSequence_with_null_nextImage_if_nextImage_returns_image_but_imageService_does_not() {
    final Image image = mock(Image.class);
    when(imageService.findFistImage()).thenReturn(Optional.empty());
    when(nextImageService.findNextImage(any())).thenReturn(Optional.of(image));

    final ModelAndView modelAndView = controller.view();

    final ImageSequenceModel model = extractImageSequenceModel(modelAndView);
    assertNull(model.getNextImage());
  }

  @Test
  public void view_returns_imageSequence_with_nextImage_if_imageService_and_nextImage_return_images() {
    final Image image = mock(Image.class);
    final Image nextImage = mock(Image.class);
    when(imageService.findFistImage()).thenReturn(Optional.of(image));
    when(nextImageService.findNextImage(any())).thenReturn(Optional.of(nextImage));

    final ModelAndView modelAndView = controller.view();

    final ImageSequenceModel model = extractImageSequenceModel(modelAndView);
    assertSame(image, model.getCurrentImage());
    assertSame(nextImage, model.getNextImage());
  }

  @Test
  public void view_returns_imageSequence_with_null_nextImage_and_null_currentImage_if_parameter_invalid() {
    final Errors errors = mock(Errors.class);
    when(errors.hasErrors()).thenReturn(true);

    final ModelAndView modelAndView = controller.view(null, errors);

    final ImageSequenceModel model = extractImageSequenceModel(modelAndView);
    assertNull(model.getCurrentImage());
    assertNull(model.getNextImage());
  }

  private ImageSequenceModel extractImageSequenceModel(final ModelAndView modelAndView) {
    final Map<String, Object> model = modelAndView.getModel();
    assertTrue(model.containsKey(MODEL_KEY));

    final Object imageSequence = model.get(MODEL_KEY);
    assertThat(imageSequence, instanceOf(ImageSequenceModel.class));

    return (ImageSequenceModel) imageSequence;
  }
}