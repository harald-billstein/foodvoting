package com.jayway.foodvoting.service;

import com.jayway.foodvoting.model.Restaurant;
import com.jayway.foodvoting.model.yelp.YelpRestaurants;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class YelpRestaurantFetcher {

  private final Logger LOGGER = LoggerFactory.getLogger(this.getClass());

  private String baseURL = "https://api.yelp.com/v3";
  private String resource = "/businesses";
  private String action = "/search";
  private String location = "Klara+Östra+Kyrkogata";
  private String term = "vegetarian";
  private String radius = "500";
  private String categories = "yelpRestaurants";
  private String token = "Bearer wXDO-HlZMD8J7OO0uS6H9E_oAqd5QC2b7JxZ3ms1eEj3RFcHEN8CcVqHKSnpSymT2VZm80Pppb5pXQOZodbTiW1W9lN-tKYrDIbDEjWKYYsHSUvy4a2ip-kc5fKgW3Yx";
  private YelpRestaurants yelpRestaurants;
  private Object key = new Object();

  public YelpRestaurantFetcher() {
    updateBusinessList();
  }

  // EVERY DAY AT MIDNIGHT
  @Scheduled(cron = "0 0 0 * * *")
  private void updateBusinessList() {
    LOGGER.info("UPDATING BUSINESS LIST");

    try {
      WebClient client = WebClient.create(baseURL);

      Mono<YelpRestaurants> restaurants = client.get()
          .uri(uriBuilder -> uriBuilder.path(resource + action)
              .queryParam("location", location)
              .queryParam("term", term)
              .queryParam("radius", radius)
              .queryParam("categories", categories)
              .build())
          .header("Authorization", token)
          .retrieve()
          .onStatus(HttpStatus::isError, clientResponse ->
              Mono.error(new RuntimeException(
                  "Http status is " + clientResponse.statusCode() + ", unable to contact "
                      + resource + action)))
          .bodyToMono(YelpRestaurants.class);

      setYelpRestaurants(restaurants.block());
    } catch (RuntimeException e) {
      LOGGER.error(e.getMessage(), e);
    }
  }

  public List<Restaurant> getYelpRestaurants() {
    synchronized (key) {
      return deepCopyOfRestaurants(this.yelpRestaurants);
    }
  }

  private void setYelpRestaurants(YelpRestaurants yelpRestaurants) {
    synchronized (key) {
      this.yelpRestaurants = yelpRestaurants;
    }
  }

  private List<Restaurant> deepCopyOfRestaurants(YelpRestaurants yelpRestaurants) {
    List<Restaurant> restaurants = new ArrayList<>();

    if (yelpRestaurants != null) {
      for (int i = 0; i < yelpRestaurants.getBusinesses().size(); i++) {
        Restaurant restaurant = new Restaurant();
        restaurant.setAddress(yelpRestaurants.getBusinesses().get(i).getLocation().getAddress1());
        restaurant.setName(yelpRestaurants.getBusinesses().get(i).getName());
        restaurant.setRating(yelpRestaurants.getBusinesses().get(i).getRating());
        restaurant.setReviewCount(yelpRestaurants.getBusinesses().get(i).getReview_count());

        restaurants.add(restaurant);
      }
    }

    return restaurants;
  }

}
