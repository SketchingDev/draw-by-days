package com.drawbydays.website.controller;

import com.drawbydays.website.ImageService;
import com.drawbydays.website.NextImageService;
import com.drawbydays.website.model.Image;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(ViewerController.class)
public class ViewerControllerIT {

  private static final String INVALID_ID = "999999999999999999999999999";

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ImageService imageService;

  @MockBean
  private NextImageService nextImageService;

  @Test
  public void model_contains_imageSequence_attribute_when_images_available() throws Exception {
    when(imageService.findFistImage()).thenReturn(Optional.of(mock(Image.class)));
    when(nextImageService.findNextImage(any())).thenReturn(Optional.of(mock(Image.class)));

    mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(model().attributeExists("imageSequence"));
  }

  @Test
  public void model_contains_imageSequence_attribute_when_images_not_available() throws Exception {
    when(imageService.findFistImage()).thenReturn(Optional.empty());
    when(nextImageService.findNextImage(any())).thenReturn(Optional.empty());

    mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(model().attributeExists("imageSequence"));
  }

  @Test
  public void model_contains_imageSequence_attribute_when_id_param_invalid() throws Exception {
    mockMvc.perform(get("/")
            .param("id", INVALID_ID))
            .andExpect(status().isOk())
            .andExpect(model().attributeExists("imageSequence"));
  }
}
