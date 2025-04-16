let EigValues = []
let EigVectorsReal = []
let EigVectorsImaginary = []
let potential = []

let psiTotal = []
let totalReal = []
let totalImaginary = []

let paused = false
let collapsed = false
let collapseTo = true
let energy
let audioList = []

let amplitudeScalar = 700

let t=0

let probabilityArray = [20,2,3,4,5,6]
let amplitudeArray = []
let amplitudePositions = []
let measurementsArray = []

let calculateSum = (array) => {
    let sum = 0
    for (i=0; i<array.length; i++) {
        sum = sum + array[i]
    }
    return sum
}

let normalize = (array) => {
    let sum = calculateSum(array)
    let output = []
    for (i=0; i<array.length; i++) {
        output.push(array[i]/sum)
    }
    return output
}

amplitudeArray = normalize(probabilityArray ,calculateSum(probabilityArray))

let recalculateAmplitudePositions = () => {
    amplitudePositions = []
    let position = 0

    for(let i=0; i<amplitudeArray.length; i++) {
        position = position + amplitudeArray[i]
        amplitudePositions.push(position)
    }
}

let recalculateProbabilities = (inputs) => {
    probabilityArray = []

    for(let i = 0; i < inputs.length; i++) {
        probabilityArray.push(parseFloat(inputs[i].value))
    }

    amplitudeArray = normalize(probabilityArray)
    recalculateAmplitudePositions()
}

let resizeMeasurements = (measurements) => {
    let measurementsArray = []
    for(let i=0; i<measurements.length; i++) {
        measurementsArray.push(parseFloat(measurements[i].dataset.measurements))
    }
    
    measurementsArray = normalize(measurementsArray)
    console.log(measurementsArray)
    
    for(let i=0; i<measurements.length; i++) {
        measurements[i].style.height = (measurementsArray[i] *100).toString() + "%"
    }
}

let resetMeasurements = (measurements) => {
    for(let i=0; i<measurements.length; i++) {
        measurements[i].dataset.measurements = (0).toString()
        measurements[i].style.height = "0%"
    }
}



function setup() {
    createCanvas(windowWidth, windowHeight)
    background(30)
    $(document).ready(function () {

            // setTimeout(() => {
            
                // Use AJAX to load the CSV file content
                $.ajax({
                    url: './Eigvalues.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let EigvaluesObject = $.csv.toObjects(data);
                        for(let i = 0; i<Object.keys(EigvaluesObject).length; i++) {
                            EigValues.push(EigvaluesObject[i].Eigvalue)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

                $.ajax({
                    url: './EigvectorsReal.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let EigVectorsRealObject = $.csv.toObjects(data);
                        // console.log(EigVectorsRealObject)
                        let tempArray = []
                        for(let i = 0; i<Object.keys(EigVectorsRealObject).length; i++) {
                            tempArray =[]
                            tempArray.push(EigVectorsRealObject[i].e0)
                            tempArray.push(EigVectorsRealObject[i].e1)
                            tempArray.push(EigVectorsRealObject[i].e2)
                            tempArray.push(EigVectorsRealObject[i].e3)
                            tempArray.push(EigVectorsRealObject[i].e4)
                            tempArray.push(EigVectorsRealObject[i].e5)
                            EigVectorsReal.push(tempArray)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

                $.ajax({
                    url: './EigvectorsImaginary.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let EigVectorsImaginaryObject = $.csv.toObjects(data);
                        // console.log(EigVectorsImaginaryObject)
                        let tempArray = []
                        for(let i = 0; i<Object.keys(EigVectorsImaginaryObject).length; i++) {
                            tempArray =[]
                            tempArray.push(EigVectorsImaginaryObject[i].e0)
                            tempArray.push(EigVectorsImaginaryObject[i].e1)
                            tempArray.push(EigVectorsImaginaryObject[i].e2)
                            tempArray.push(EigVectorsImaginaryObject[i].e3)
                            tempArray.push(EigVectorsImaginaryObject[i].e4)
                            tempArray.push(EigVectorsImaginaryObject[i].e5)
                            EigVectorsImaginary.push(tempArray)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

                $.ajax({
                    url: './Vpot.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let potentialObject = $.csv.toObjects(data);
                        // console.log(EigVectorsImaginaryObject)
                        for(let i = 0; i<Object.keys(potentialObject).length; i++) {
                            potential.push(potentialObject[i].potential * 30)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

            // }, .2)
        
            
    });


    setTimeout(() => {
        console.log(potential)

        psiTotal = []
        totalImaginary = []
        totalReal = []
        let temporaryReal
        let temporaryImaginary

        for(let i=0; i < EigVectorsReal.length; i++) {
            temporaryReal = 0
            temporaryImaginary = 0

            for(let j=0; j<5; j++) {
                temporaryReal += Math.cos(EigValues[j]) * EigVectorsReal[i][j] - Math.sin(EigValues[j])*EigVectorsImaginary[i][j]
                temporaryImaginary += Math.cos(EigValues[j]) * EigVectorsImaginary[i][j] + Math.sin(EigValues[j])*EigVectorsReal[i][j]
            }
            totalReal.push(temporaryReal)
            totalImaginary.push(temporaryImaginary)

            psiTotal.push((amplitudeScalar*temporaryReal**2) + amplitudeScalar*temporaryImaginary**2)
        }

    }, 300)
}



    
function draw() {
    let sliderInputs = []

    for(let i=0; i <EigValues.length; i++) {
        sliderInputs.push(document.getElementById("E" + (i+1).toString()))
    }

    recalculateProbabilities(sliderInputs)
    if(paused==false) {
        translate(-512 + windowWidth/2, windowHeight/2)
        drawingContext.setLineDash([2,4])
        strokeWeight(1.5)
        stroke(255,255,255)
        for(let i = 0; i<EigValues.length; i++){
            line(0,-30*EigValues[i], 512*2,-30*EigValues[i])
        }
        drawingContext.setLineDash([1])
        stroke(222,35,12)
        background(220,220,220,90)
        noFill()
        
        beginShape()
        for(let i = 0; i< psiTotal.length; i++) {
            vertex(i*2,-psiTotal[i])
        }
        endShape()
    
        drawingContext.setLineDash([1,4])
        stroke(12,55,232)
        beginShape()
        for(let i = 0; i<potential.length; i++) {
            vertex(i*2, -potential[i])
        }
        endShape()

        

        t += .04
        psiTotal = []
        totalReal = []
        totalImaginary = []
    
        
        
        // reverse loop 
        for(let i=0; i < EigVectorsReal.length; i++) {
            temporaryReal = 0
            temporaryImaginary = 0

            
    
            if(collapsed) { 
                if(collapseTo) {
                    let iterator = 0
                    energy = Math.random()
                    while (energy > amplitudePositions[iterator]) {
                        iterator++
                    }
                    energy = iterator
                    audioList[energy].play()

                    let measurements = document.querySelectorAll(".measurement")

                    measurements[energy].dataset.measurements = ((parseInt(measurements[energy].dataset.measurements)) + 1).toString()

                    resizeMeasurements(measurements)
                    collapseTo = false
                }
                // pause loop
                temporaryReal += (Math.cos(EigValues[energy]*t) * EigVectorsReal[i][energy] - Math.sin(EigValues[energy]*t)*EigVectorsImaginary[i][energy])
                temporaryImaginary += (Math.cos( EigValues[energy]*t) * EigVectorsImaginary[i][energy] + Math.sin(EigValues[energy]*t)*EigVectorsReal[i][energy])
            } else { 
                for(let j=0; j<EigValues.length; j++) {
                    // * initial coefficients?
                    temporaryReal += (Math.cos(EigValues[j]*t) * EigVectorsReal[i][j] - Math.sin(EigValues[j]*t)*EigVectorsImaginary[i][j]) * amplitudeArray[j]
                    temporaryImaginary += (Math.cos( EigValues[j]*t) * EigVectorsImaginary[i][j] + Math.sin(EigValues[j]*t)*EigVectorsReal[i][j]) * amplitudeArray[j]
                }
            }
            totalReal.push(temporaryReal)
            totalImaginary.push(temporaryImaginary)
    
            if(collapsed) {
                psiTotal.push((((amplitudeScalar/EigValues.length)*temporaryReal**2) + (amplitudeScalar/EigValues.length)*temporaryImaginary**2) + EigValues[energy] * 30)
            } else {
                psiTotal.push((amplitudeScalar*temporaryReal**2) + amplitudeScalar*temporaryImaginary**2)
            }
        }
    }
}

setTimeout(() => {
    let audioContainer = document.querySelector('.audioContainer')


    for (let i = 0; i < 6; i++) {
        let audioSrc = './samples' + i.toString() + '.wav'
        let audio = document.createElement('audio')
        audio.src = audioSrc
        audio.id = 'audio' + i.toString()
        audioContainer.appendChild(audio)
        audioList.push(audio)
    }

    let stopButton = document.getElementById("stop")
    stopButton.addEventListener('click', function(e){
        paused = !paused
    })

    let resetButton = document.getElementById("reset")
    resetButton.addEventListener('click', function(e){
        resetMeasurements(document.querySelectorAll(".measurement"))
    })
    
    let collapseButton = document.getElementById("collapse")
    collapseButton.addEventListener('click', function(e){
        collapsed = !collapsed

        if(collapsed) {
            collapseTo = true
        }
    })

    let audio = document.getElementById('audio')

    let soundButton = document.getElementById('sound')
    soundButton.addEventListener('click', function(e){
        audio.play()
    })

    




    // let tPoints = document.querySelectorAll('div.t-point')
    // let bars = document.querySelectorAll('.bar')

    // let resizeBars = () => {
    //     for (let i = 0; i < amplitudeArray.length; i++) {
    //         bars[i].style.width = (amplitudeArray[i] * 100).toString() + '%'
    //     }
    // }

    // resizeBars()

    // let resizeTarget
    // let resizing = false

    // for (let i = 0; i<tPoints.length; i++) {
    //     tPoints[i].addEventListener('mousedown', (event => {
    //         resizing = true
    //         resizeTarget = event.target.parentElement
    //     }))
    // }

    // document.addEventListener('mouseup', (event => {
    //     if (resizing) {
    //         resizeTarget.style.width = ((1 - (event.screenX / (windowWidth/2)))*100).toString() + '%'
    //         resizing = false
    //         recalculateProbabilities()
    //     }
    // }))
}, 400)


