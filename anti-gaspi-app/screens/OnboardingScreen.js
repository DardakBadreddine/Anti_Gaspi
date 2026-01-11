import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
    {
        id: 1,
        icon: null, // Will use logo image
        title: 'Bienvenue sur Anti-Gaspi',
        description: 'Rejoignez la lutte contre le gaspillage alimentaire. Découvrez des paniers anti-gaspi près de chez vous et faites des économies tout en préservant la planète.',
        color: '#22c55e',
    },
    {
        id: 2,
        icon: '🛒',
        title: 'Trouvez des paniers près de vous',
        description: 'Parcourez les commerces de votre quartier et découvrez leurs paniers anti-gaspi. Filtrez par catégories, distance et prix pour trouver exactement ce que vous cherchez.',
        color: '#3b82f6',
    },
    {
        id: 3,
        icon: '💰',
        title: 'Économisez jusqu\'à 70%',
        description: 'Profitez de réductions exceptionnelles sur des produits de qualité. Les commerçants proposent leurs invendus à prix réduits pour éviter le gaspillage.',
        color: '#f59e0b',
    },
    {
        id: 4,
        icon: '🤝',
        title: 'Rejoignez la communauté',
        description: 'Créez votre compte et commencez à réserver vos paniers. Vous pouvez aussi devenir commerçant et proposer vos propres paniers anti-gaspi !',
        color: '#8b5cf6',
    },
];

const OnboardingScreen = ({ onComplete }) => {
    const insets = useSafeAreaInsets();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollViewRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation d'entrée pour chaque slide avec rotation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentSlide]);

    const handleScroll = (event) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (slideIndex !== currentSlide && slideIndex >= 0 && slideIndex < ONBOARDING_SLIDES.length) {
            setCurrentSlide(slideIndex);
            // Reset animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            rotateAnim.setValue(0);
        }
    };

    const goToSlide = (index) => {
        if (index >= 0 && index < ONBOARDING_SLIDES.length) {
            scrollViewRef.current?.scrollTo({
                x: index * SCREEN_WIDTH,
                animated: true,
            });
            setCurrentSlide(index);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            rotateAnim.setValue(0);
        }
    };

    const handleNext = () => {
        if (currentSlide < ONBOARDING_SLIDES.length - 1) {
            goToSlide(currentSlide + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        onComplete();
    };

    const renderSlide = (slide, index) => {
        const isActive = index === currentSlide;
        const rotate = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <View key={slide.id} style={styles.slide}>
                <View style={styles.slideContent}>
                    {/* Animated Icon with bounce */}
                    {isActive ? (
                        <Animated.View
                            style={[
                                styles.iconContainer,
                                slide.icon ? { backgroundColor: slide.color + '20' } : {},
                                {
                                    transform: [
                                        { scale: scaleAnim },
                                        { rotate: rotate },
                                    ],
                                },
                            ]}
                        >
                            {slide.icon ? (
                                <Text style={styles.icon}>{slide.icon}</Text>
                            ) : (
                                <Image 
                                    source={require('../assets/images/antigaspiLogo.png')} 
                                    style={styles.logoImage}
                                    resizeMode="cover"
                                />
                            )}
                        </Animated.View>
                    ) : (
                        <View
                            style={[
                                styles.iconContainer,
                                slide.icon ? { backgroundColor: slide.color + '20', opacity: 0.3 } : { opacity: 0.3 },
                            ]}
                        >
                            {slide.icon ? (
                                <Text style={styles.icon}>{slide.icon}</Text>
                            ) : (
                                <Image 
                                    source={require('../assets/images/antigaspiLogo.png')} 
                                    style={styles.logoImage}
                                    resizeMode="cover"
                                />
                            )}
                        </View>
                    )}

                    {isActive ? (
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
                            <Text style={styles.description}>{slide.description}</Text>
                        </Animated.View>
                    ) : (
                        <View style={{ opacity: 0.3 }}>
                            <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
                            <Text style={styles.description}>{slide.description}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Skip Button */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
            >
                <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>

            {/* Slides */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {ONBOARDING_SLIDES.map((slide, index) => renderSlide(slide, index))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {ONBOARDING_SLIDES.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dot,
                            index === currentSlide && styles.dotActive,
                            { backgroundColor: index === currentSlide ? ONBOARDING_SLIDES[currentSlide].color : '#E5E5EA' }
                        ]}
                        onPress={() => goToSlide(index)}
                    />
                ))}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigation}>
                {currentSlide > 0 && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => goToSlide(currentSlide - 1)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                )}

                <View style={[styles.buttonContainer, currentSlide === 0 && styles.buttonContainerFull]}>
                    <Button
                        title={currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
                        onPress={handleNext}
                        style={styles.nextButton}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    slideContent: {
        alignItems: 'center',
        maxWidth: 320,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    icon: {
        fontSize: 80,
    },
    logoImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 17,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 8,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E5EA',
    },
    dotActive: {
        width: 24,
        height: 8,
        borderRadius: 4,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonContainer: {
        flex: 1,
        marginLeft: 16,
    },
    buttonContainerFull: {
        marginLeft: 0,
    },
    nextButton: {
        marginBottom: 0,
    },
});

export default OnboardingScreen;
