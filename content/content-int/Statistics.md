# 2.3. Statistical Foundations


(mean)=
## Mean
The *mean* (or average) is a measure of the central tendency of a dataset. It represents the value around which the data is centered, and it is calculated by summing up all the values in the dataset and dividing them by the number of values. 

For a dataset $x_1, x_2, \dots, x_n$, the mean is:

$$
\mu = \frac{1}{n} \sum_{i=1}^{n} x_i
$$

```{admonition} Example: Calculating the mean
:class: dropdown
:open: false
Given data: $[2, 4, 6, 8]$

Calculate the mean:
$$
\mu = \frac{2 + 4 + 6 + 8}{4} = 5
$$
```

--- 
```{hint} Interactive Exploration: the Widget Explanation
:class: dropdown
:open: true
:icon: true
Use this widget to explore how the center (mean) of a dataset behaves across different dimensions.
 
 1. **Generate Data**: Creates a random 2D dataset shaped as a cluster and simultaneously displays its flattened 1D projection. You can adjust the number of points using the input field.  
 2. **Find Mean**: Calculates the mathematical average of the points and highlights this center (the red dot) in both the full 2D space and the compressed 1D line.
```

```{anywidget} assets/mean.mjs
:css: assets/variance.css
{
  "step": 0
}
```
---


(variance)=
## Variance
*Variance* measures how spread out a dataset is around its mean. It quantifies how much the values deviate from the average value; in other words, variance indicates how much the values differ from the mean.

For a dataset $x_1, x_2, \dots, x_n$, the sample variance is:

$$
\sigma^2 = \frac{1}{n-1} \sum_{i=1}^{n} (x_i - \mu)^2
$$

A high variance means the data is widely spread, while a low variance means the data is tightly clustered around the mean.


```{admonition} Example: Calculating variance
:class: dropdown
:open: false
Given data: $[2, 4, 6, 8]$

First compute the mean:
$$
\mu = \frac{2 + 4 + 6 + 8}{4} = 5
$$

Next compute the *deviations*, which are the differences between each value and the mean:

$$
x_i - \mu = [-3, -1, 1, 3]
$$

Square the deviations:

$$
[9, 1, 1, 9]
$$

Then compute the variance:

$$
\sigma^2 = \frac{9 + 1 + 1 + 9}{3} = 6.67
$$
```

--- 
```{hint} Interactive Exploration: the Widget Explanation
:class: dropdown
:open: true
:icon: true
Use the widget below to explore how identifying the axis of maximum variance - the direction where data is most spread out - allows us to compress data into fewer dimensions while preserving its core structure.
 
 **Generate Data**: Creates a random 2D dataset shaped as a cluster. You can adjust the number of points using the input field.  
 1. **Max Variance Direction**: Calculates and draws a line through the center of the data that follows the direction of maximum spread (variance).
 2. **Show Projections**: Reveals the shortest, perpendicular paths (dashed red lines) required to project each 2D point directly onto the new 1D axis.
 3. **Project Data**: Watch the dimensionality reduction take place. The entire space rotates and the 2D points collapse along their projection paths onto the 1D number line, compressing the data while preserving its overall distribution.
```
   
```{anywidget} assets/variance.mjs
:css: assets/variance.css
{
  "step": 0
}
```
    

```{tip} How is this related to PCA?
:class: dropdown
:open: false

- What is happening: The algorithm finds the primary direction of the data's spread and draws the blue line to represent this axis (in PCA, this is known as the First Principal Component, or $PC_1$).
- The Result: When the points are projected perpendicularly onto this blue line—represented by the red dashed lines - they land far apart from each other. The projected data retains a high variance (spread).
- Relation to PCA: PCA is fundamentally a dimensionality reduction method; it aims to compress data into fewer dimensions while keeping the most critical structural information intact. To do this, PCA relies on the mathematical principle that variance represents information. By mathematically searching for and selecting the exact axis that maximizes the data spread, PCA ensures the most important characteristics of the dataset are preserved during compression.
```
---


(covariance)=
## Covariance
*Covariance* measures how two variables change together. It indicates whether increases in one variable correspond to increases or decreases in another.
If the variables tend to increase or decrease simultaneously, covariance is positive. If one increases while the other decreases, covariance is negative. Zero covariance means that there is no linear relationship between the variables.

For two variables $x$ and $y$ with means $\mu_x$ and $\mu_y$, the sample covariance is:

$$
\mathrm{cov}(x,y)
=
\frac{1}{n-1} \sum_{i=1}^{n} (x_i - \mu_x)(y_i - \mu_y)
$$


```{admonition} Example: Calculating covariance
:class: dropdown
:open: false
Given two variables:

$x = [1, 2, 3]$, $y = [2, 4, 6]$

First compute the means:

$$
\mu_x = 2, \quad \mu_y = 4
$$

Next compute the *deviations* (distance from the mean for each value):

$x - \mu_x = [-1, 0, 1]$

$y - \mu_y = [-2, 0, 2]$

Now multiply corresponding deviations:

$[2, 0, 2]$

Finally, compute covariance:

$$
\mathrm{cov}(x,y) = \frac{2 + 0 + 2}{2} = 2
$$
```


