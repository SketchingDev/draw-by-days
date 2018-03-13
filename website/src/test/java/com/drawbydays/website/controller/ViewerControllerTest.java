package com.drawbydays.website.controller;

import com.drawbydays.website.storage.ImageEntity;
import com.drawbydays.website.storage.ImageRepository;
import org.hamcrest.Matcher;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.net.URI;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.beans.HasPropertyWithValue.hasProperty;
import static org.hamcrest.core.AllOf.allOf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ViewerControllerTest {
  private static final URI IMAGE_1_URI = URI.create("./images/1.png");
  private static final URI IMAGE_2_URI = URI.create("./images/2.png");

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ImageRepository repository;

  @Test
  @DirtiesContext
  public void two_images_in_storage_results_in_response_currentImage_is_image1_and_nextImage_is_image2() throws Exception {
    repository.save(new ImageEntity(IMAGE_1_URI));
    repository.save(new ImageEntity(IMAGE_2_URI));

    mockMvc.perform(get("/"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("imageSequence",
        allOf(
          propertyContainsUri("currentImage", IMAGE_1_URI),
          propertyContainsUri("nextImage", IMAGE_2_URI)
        )
      ));
  }

  @Test
  public void no_images_in_storage_results_in_response_currentImage_is_null_and_nextImage_is_null() throws Exception {
    mockMvc.perform(get("/"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("imageSequence",
        allOf(
          hasProperty("currentImage", nullValue()),
          hasProperty("nextImage", nullValue())
        )
      ));
  }

  @Test
  @DirtiesContext
  public void invalid_id_results_in_response_currentImage_is_null_and_nextImage_is_null() throws Exception {
    repository.save(new ImageEntity(IMAGE_1_URI));
    repository.save(new ImageEntity(IMAGE_2_URI));

    mockMvc.perform(get("/")
      .param("id", "INVALID ID"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("imageSequence",
        allOf(
          hasProperty("currentImage", nullValue()),
          hasProperty("nextImage", nullValue())
        )
      ));
  }

  @Test
  @DirtiesContext
  public void one_image_in_storage_results_in_response_currentImage_is_image1_and_nextImage_is_image1() throws Exception {
    repository.save(new ImageEntity(IMAGE_1_URI));

    mockMvc.perform(get("/"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("imageSequence",
        allOf(
          propertyContainsUri("currentImage", IMAGE_1_URI),
          propertyContainsUri("nextImage", IMAGE_1_URI)
        )
      ));
  }

  @Test
  @DirtiesContext
  public void two_images_in_storage_and_id_of_1_results_in_response_currentImage_is_image1_and_nextImage_is_image2() throws Exception {
    final long id = repository.save(new ImageEntity(IMAGE_1_URI)).getId();
    repository.save(new ImageEntity(IMAGE_2_URI));

    mockMvc.perform(get("/")
      .param("id", String.valueOf(id)))
      .andExpect(status().isOk())
      .andExpect(model().attribute("imageSequence",
        allOf(
          propertyContainsUri("currentImage", IMAGE_1_URI),
          propertyContainsUri("nextImage", IMAGE_2_URI)
        )
      ));
  }

  @Test
  @DirtiesContext
  public void two_images_in_storage_and_id_of_2_results_in_response_currentImage_is_image2_and_nextImage_is_image1() throws Exception {
    repository.save(new ImageEntity(IMAGE_1_URI));
    final long id = repository.save(new ImageEntity(IMAGE_2_URI)).getId();

    mockMvc.perform(get("/")
      .param("id", String.valueOf(id)))
      .andExpect(status().isOk())
      .andExpect(model().attribute("imageSequence",
        allOf(
          propertyContainsUri("currentImage", IMAGE_2_URI),
          propertyContainsUri("nextImage", IMAGE_1_URI)
        )
      ));
  }

  private static <T> Matcher<T> propertyContainsUri(final String propertyName, final URI uri) {
    return hasProperty(propertyName, hasProperty("uri", is(uri)));
  }
}
