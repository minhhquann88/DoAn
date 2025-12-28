package com.coursemgmt.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    // (1-n) 1 Category cÃ³ nhiá»u Course
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Bá» qua khi serialize Ä‘á»ƒ trÃ¡nh circular reference vÃ  Ä‘áº£m báº£o response Ä‘Ãºng format
    private List<Course> courses;
}
