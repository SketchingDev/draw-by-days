package com.drawbydays.website.controller;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.drawbydays.website.storage.Image;
import com.drawbydays.website.storage.ImageRepository;
import java.util.Optional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.ui.Model;

@RunWith(MockitoJUnitRunner.class)
public class ViewerControllerTest {

  @Mock
  private ImageRepository imageRepository;

  @Mock
  private Model model;

  @Test(expected = NullPointerException.class)
  public void exceptionThrownIfInstantiatedWithNull() {
    new ViewerController(null);
  }

  @Test
  public void viewNamedViewReturned() {
    when(imageRepository.getRandomImage()).thenReturn(Optional.empty());
    final ViewerController controller = new ViewerController(imageRepository);

    assertEquals("viewer", controller.viewer(mock(Model.class)));
  }

  @Test
  public void modelAddAttributeCalledWithImageIfRepositoryReturnsImage() {
    final Optional<Image> optionalImage = Optional.of(mock(Image.class));
    when(imageRepository.getRandomImage()).thenReturn(optionalImage);

    new ViewerController(imageRepository).viewer(model);

    verify(model).addAttribute(anyString(), eq(optionalImage.get()));
  }

  @Test
  public void modelAddAttributeNotCalledIfRepositoryReturnsNothing() {
    when(imageRepository.getRandomImage()).thenReturn(Optional.empty());

    new ViewerController(imageRepository).viewer(model);

    verify(model, never()).addAttribute(anyString(), anyObject());
  }
}