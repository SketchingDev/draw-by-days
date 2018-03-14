package com.drawbydays.website.gallery;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GalleryControllerTest {
  private static final URI IMAGE_1_URI = URI.create("./images/1.png");
  private static final URI IMAGE_2_URI = URI.create("./images/2.png");

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ImageRepository repository;

  @Test
  @DirtiesContext
  public void two_images_in_storage_results_in_response_image_is_image1_and_nextImage_is_image2() throws Exception {
    repository.save(new Image(IMAGE_1_URI));
    repository.save(new Image(IMAGE_2_URI));

    mockMvc.perform(get("/"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("image", hasProperty("uri", is(IMAGE_1_URI))))
      .andExpect(model().attribute("nextImage", hasProperty("uri", is(IMAGE_2_URI))));
  }

  @Test
  public void no_images_in_storage_results_in_response_image_is_null_and_nextImage_is_null() throws Exception {
    mockMvc.perform(get("/"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("image", nullValue()))
      .andExpect(model().attribute("nextImage", nullValue()));
  }

  @Test
  @DirtiesContext
  public void invalid_id_results_in_response_image_is_null_and_nextImage_is_null() throws Exception {
    repository.save(new Image(IMAGE_1_URI));
    repository.save(new Image(IMAGE_2_URI));

    mockMvc.perform(get("/")
      .param("id", "INVALID ID"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("image", nullValue()))
      .andExpect(model().attribute("nextImage", nullValue()));
  }

  @Test
  @DirtiesContext
  public void one_image_in_storage_results_in_response_image_is_image1_and_nextImage_is_image1() throws Exception {
    repository.save(new Image(IMAGE_1_URI));

    mockMvc.perform(get("/"))
      .andExpect(status().isOk())
      .andExpect(model().attribute("image", hasProperty("uri", is(IMAGE_1_URI))))
      .andExpect(model().attribute("nextImage", hasProperty("uri", is(IMAGE_1_URI))));
  }

  @Test
  @DirtiesContext
  public void two_images_in_storage_and_id_of_1_results_in_response_image_is_image1_and_nextImage_is_image2() throws Exception {
    final long id = repository.save(new Image(IMAGE_1_URI)).getId();
    repository.save(new Image(IMAGE_2_URI));

    mockMvc.perform(get("/")
      .param("id", String.valueOf(id)))
      .andExpect(status().isOk())
            .andExpect(model().attribute("image", hasProperty("uri", is(IMAGE_1_URI))))
            .andExpect(model().attribute("nextImage", hasProperty("uri", is(IMAGE_2_URI))));
  }

  @Test
  @DirtiesContext
  public void two_images_in_storage_and_id_of_2_results_in_response_image_is_image2_and_nextImage_is_image1() throws Exception {
    repository.save(new Image(IMAGE_1_URI));
    final long id = repository.save(new Image(IMAGE_2_URI)).getId();

    mockMvc.perform(get("/")
      .param("id", String.valueOf(id)))
      .andExpect(status().isOk())
      .andExpect(model().attribute("image", hasProperty("uri", is(IMAGE_2_URI))))
      .andExpect(model().attribute("nextImage", hasProperty("uri", is(IMAGE_1_URI))));
  }
}
