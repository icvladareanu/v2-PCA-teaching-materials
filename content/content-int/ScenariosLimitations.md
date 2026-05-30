# 5. PCA: Applications and Limitations

PCA is not just a theoretical tool for reducing dimensions - it is widely used in real-world systems where data is high-dimensional, noisy, or difficult to visualize. However, it also comes with important assumptions and limitations that determine when it works well and when it fails.

## Applications of PCA in the Real World

PCA is most useful when data has many features that are correlated or redundant, meaning the same underlying information is being repeated in different forms. In these cases, PCA helps compress, simplify, or reveal structure in the data.

### Image Compression (Finding Eigenfaces)
One of the most famous and visually striking applications of Principal Component Analysis is image compression and facial recognition.

A grayscale image of size 100 × 100 already contains 10,000 pixel values. However, many of these pixels are highly correlated. Neighboring pixels tend to have similar intensities, and facial images share common structural patterns such as the positions of the eyes, nose, mouth, and overall facial geometry.

PCA exploits this redundancy by finding the directions of maximum variance across a large collection of face images. To do this, each image is first flattened into a long vector, mean-centered, and used to construct a covariance matrix. Performing PCA on this dataset produces a set of principal components that capture the most significant variations between faces.

In facial recognition, these principal components are known as Eigenfaces. An eigenface is not a complete face image, but rather a fundamental pattern of variation extracted from the training dataset. Some eigenfaces may emphasize eye placement, others lighting conditions, facial proportions, or other distinguishing facial structures.

```{figure} figures/eigenfaces.*
:label: fig-eigenfaces
:alt: PCA applied to find eigenfaces

*Figure 6.* Applying Principal Component Analysis to extract the foundational structural patterns of human faces.    
PCA reduces the high-dimensional pixel space of the original face database into a compact set of orthogonal basis vectors called *Eigenfaces*, each capturing a distinct global variance characteristic (such as lighting angle or facial symmetry).   

Source: @eigenfaces   
Facial dataset from: @LFW
```

### Patient Profiling in Medicine (Bioinformatics) [@ma2011bioinformatics]

In modern medical research, scientists can measure thousands of biological markers (like gene activity levels) from a single patient tissue sample. This creates a massive data problem: a study might only have 50 patients, but each patient comes with 20,000 individual measurements. Trying to find patterns in a 20,000-dimensional space is practically impossible. 

Fortunately, these biological markers don't act alone - groups of hundreds of genes typically rise and fall together when fighting a specific disease. PCA exploits this teamwork to compress the overwhelming number of measurements down to just two or three main components.
- **Spotting Hidden Groups**: When patients are projected onto the first few principal components, meaningful structure often emerges. Patients with similar biological characteristics may cluster together, allowing researchers to identify disease subtypes, treatment responses, or other underlying patterns that were difficult to observe in the original high-dimensional data.
- **Understanding Sources of Variation**: Researchers can also examine the loadings (the weight or contribution of each original variable) of the principal components to determine which genes contribute most strongly to the observed patterns. This can provide valuable clues about the biological processes associated with a disease. 


### Formula 1 Race Outcomes [@f1]
Modern Formula 1 cars are equipped with hundreds of sensors that continuously record telemetry data during a race. These sensors monitor variables such as tire temperatures, fuel consumption, brake performance, engine parameters, cornering speeds, and environmental conditions.

As a result, teams collect enormous amounts of high-dimensional data. Many of these measurements are strongly correlated. For example, engine temperature, fuel consumption, and tire wear may all be influenced by driving style and track conditions. PCA can be used to reduce this complexity by identifying the dominant patterns of variation within the telemetry data.

By applying PCA to seasonal race telemetry, researchers can filter through the noise and compress these interconnected variables down to just a few principal components:
- **Isolating Dominant Performance Patterns**: Instead of analyzing hundreds of sensor streams individually, PCA combines correlated measurements into a smaller number of principal components. These components often capture broad or dominant patterns such as overall vehicle performance, tire degradation behaviour, aerodynamic efficiency, etc. This allows engineers to focus on the most important sources of variation without being overwhelmed by hundreds of interconnected variables.

- **Simplifying Predictive Models**: By replacing hundreds of correlated variables with a small set of principal components, PCA creates a more compact representation of the data. These components can then be used as inputs to Machine Learning models that predict race performance, optimize vehicle setup, or identify unusual behavior in the car.

## Limitations of PCA

While PCA is a powerful and widely used technique for dimensionality reduction, it is fundamentally constrained by several mathematical assumptions. Understanding these limitations is essential when determining whether PCA is an appropriate choice for a particular dataset.

### The Assumption of Linearity
PCA is inherently a linear method. It assumes that the most important structure in the data can be captured through linear combinations of the original features. However, many real-world datasets contain complex nonlinear patterns. When the data lies on a complex nonlinear manifold — such as a sphere, ring, spiral, or other curved structure — PCA cannot accurately model these relationships. Instead, it projects the data onto a lower-dimensional linear space, potentially destroying the meaningful, natural geometry of the dataset and making important patterns harder to identify.


### Sensitivity to Feature Scale
PCA searches for directions with the highest variance. As a result, features with larger numerical values or wider ranges can have a much greater influence on the principal components than features with smaller ranges. For example, a feature measured in thousands may dominate the analysis compared to a feature measured in decimals, even if both are equally important. Therefore, it is often necessary to standardize the data so that all features have a similar scale before applying PCA.

### Vulnerability to Outliers
PCA is sensitive to outliers because it relies on the covariance matrix, which is strongly affected by extreme values. A small number of unusual observations can disproportionately affect the estimated directions of maximum variance, causing the principal components to align with the outliers rather than the dominant structure present in the majority of the data. This can lead to a lower-dimensional representation that does not accurately describe most of the dataset.

### Loss of Feature Interpretability
One disadvantage of PCA is that the resulting principal components can be difficult to interpret. In the original dataset, features typically correspond to meaningful real-world quantities such as age, income, fuel consumption, or temperature. Principal components, however, are weighted combinations of multiple original variables. Although these components may capture a large amount of the dataset's variance, their physical or practical meaning can be difficult to interpret. This can make the results harder to communicate to domain experts and stakeholders.

### Variance Does Not Always Correspond to Importance
PCA operates under the assumption that directions with the greatest variance contain the most relevant information. However, this assumption is not universally valid. In some applications, variables with relatively low variance may carry critical information for tasks such as classification, anomaly detection, or prediction. Since PCA prioritizes variance rather than task-specific relevance, important information can sometimes be discarded during dimensionality reduction.