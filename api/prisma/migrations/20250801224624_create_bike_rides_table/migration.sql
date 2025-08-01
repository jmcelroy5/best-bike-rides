-- CreateTable
CREATE TABLE "public"."BikeRoute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "geoJSON" JSONB NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "elevationGain" DOUBLE PRECISION NOT NULL,
    "startPoint" JSONB,

    CONSTRAINT "BikeRoute_pkey" PRIMARY KEY ("id")
);
